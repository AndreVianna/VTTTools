using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.WebAssembly.Pages.Library.Scenes;

public partial class SceneBuilderPage : ComponentBase, IAsyncDisposable {
    [Parameter]
    public Guid SceneId { get; set; }

    [Inject]
    internal ISceneBuilderHttpClient SceneBuilder { get; set; } = null!;

    [Inject]
    internal IJSRuntime JsRuntime { get; set; } = null!;

    [Inject]
    internal PersistentComponentState ApplicationState { get; set; } = null!;

    [Inject]
    internal SceneBuilderStorageService StorageService { get; set; } = null!;

    private PersistingComponentStateSubscription? _persistingSubscription;
    private bool _hasRestoredState;

    private const string _assetBasePath = "/uploads/assets";
    private const string _stageBasePath = "/uploads/stages";
    private const int _maxFileSize = 10 * 1024 * 1024; // 10 MB

    private static readonly Point _canvasPadding = new(BuilderState.Padding, BuilderState.Padding);

    private bool _canvasReady;
    private ElementReference _canvasContainerRef;
    private bool _isDisposed;
    private Timer? _mouseMoveTimer;
    private Rectangle? _canvasWindow;

    internal BuilderState State { get; set; } = new();
    internal GuidInput Input { get; set; } = new();
    internal SceneDetails? Scene { get; set; }
    internal string StageImageUrl { get; set; } = string.Empty;
    internal SelectedAsset? SelectedAsset { get; set; }
    public IBrowserFile? SelectedStageFile { get; set; }
    public IBrowserFile? SelectedAssetFile { get; set; }

    public async ValueTask DisposeAsync() {
        if (_isDisposed)
            return;
        _persistingSubscription?.Dispose();
        if (_mouseMoveTimer is not null)
            await _mouseMoveTimer.DisposeAsync();

        GC.SuppressFinalize(this);
        _isDisposed = true;
    }

    // Base path for assets
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _persistingSubscription = ApplicationState.RegisterOnPersisting(PersistSceneData);

        // Initialize state with scene ID
        State.SceneId = SceneId;

        if (!_hasRestoredState && ApplicationState.TryTakeFromJson<SceneBuilderPersistedData>($"SceneBuilder_{SceneId}", out var persistedData) && persistedData != null) {
            _hasRestoredState = true;
            Scene = persistedData.Scene;
        }

        if (Scene == null && !OperatingSystem.IsBrowser())
            await LoadSceneAsync();
        if (_canvasReady)
            await InitStageAsync();
    }

    private Task PersistSceneData() {
        if (Scene == null || OperatingSystem.IsBrowser())
            return Task.CompletedTask;

        var dataToPersist = new SceneBuilderPersistedData {
            Scene = Scene,
        };

        ApplicationState.PersistAsJson($"SceneBuilder_{SceneId}", dataToPersist);
        return Task.CompletedTask;
    }

    //private bool _sceneJsInitialized;
    protected override async Task OnAfterRenderAsync(bool firstRender) {
        if (!firstRender)
            return;
        await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./builder.js");

        _canvasReady = true;
        if (Scene == null && OperatingSystem.IsBrowser())
            await LoadSceneAsync();
        await InitStageAsync();
    }

    private async Task LoadSceneAsync() {
        try {
            var scene = await SceneBuilder.GetSceneByIdAsync(SceneId);
            if (scene == null) {
                Console.WriteLine($"Failed to load scene {SceneId}");
                return;
            }
            Scene = scene;
            StageImageUrl = GetImageUrl(_stageBasePath, Scene.Stage.Type, Scene.Stage.FileName ?? Scene.Id.ToString());

            // Initialize state from scene and local storage
            await InitializeStateAsync();

            await InvokeAsync(StateHasChanged);
        }
        catch (Exception ex) {
            Console.WriteLine($"Error loading scene: {ex.Message}");
        }
    }

    private async Task InitStageAsync() {
        if (Scene is null)
            return;

        // Calculate canvas size and update state
        State.CanvasSize = SceneCalculations.CalculateCanvasSize(Scene.Stage.Size, BuilderState.Padding);

        var renderData = CreateRenderData();
        await JsRuntime.InvokeVoidAsync("setup", Scene.Id.ToString(), renderData);

        // Get canvas bounding rect for coordinate calculations
        await SetCanvasWindowAsync();
    }

    private async Task InitializeStateAsync() {
        if (Scene is null)
            return;

        // Load state from local storage
        var (panOffset, zoomLevel, grid) = await StorageService.LoadStateAsync(State.SceneId, Scene.ZoomLevel);
        State.PanOffset = panOffset;
        State.ZoomLevel = zoomLevel;
        State.Grid = grid;
        State.CanvasSize = SceneCalculations.CalculateCanvasSize(Scene.Stage.Size, BuilderState.Padding);
    }

    private async Task SetCanvasWindowAsync() {
        try {
            _canvasWindow = await JsRuntime.InvokeAsync<Rectangle>("getCanvasRect", _canvasContainerRef);
        }
        catch (Exception ex) {
            Console.WriteLine($"Error getting canvas rect: {ex.Message}");
        }
    }

    private object CreateRenderData() {
        if (Scene is null) return new { };
        var fileName = Scene.Stage.FileName ?? Scene.Id.ToString();
        return new {
            imageUrl = GetImageUrl(_stageBasePath, Scene.Stage.Type, fileName),
            grid = new {
                type = State.Grid.Type,
                cellSize = State.Grid.CellSize,
                offset = State.Grid.Offset,
                snap = State.Grid.Snap,
            },
            assets = Scene.Assets.Select(a => new {
                id = a.Id,
                number = a.Number,
                name = a.Name,
                position = a.Position,
                scale = a.Scale,
                isSelected = a.Id == SelectedAsset?.Id,
                imageUrl = GetImageUrl(_assetBasePath, a.ResourceType, a.DisplayId),
                isLocked = a.IsLocked,
            }).ToArray(),
        };
    }

    private async Task RenderAsync() {
        if (Scene is null)
            return;
        var data = CreateRenderData();
        await JsRuntime.InvokeVoidAsync("render", data);
    }

    private static string GetImageUrl(string basePath, ResourceType resourceType, string name) {
        var extension = GetFileExtension(resourceType);
        return $"{basePath}/{name}{extension}";
    }

    private static string GetFileExtension(ResourceType resourceType)
        => resourceType switch {
            ResourceType.Image => ".png",
            ResourceType.Animation => ".gif",
            ResourceType.Video => ".mp4",
            _ => throw new NotSupportedException($"File type {resourceType} is not supported."),
        };

    private void OpenChangeImageModal() => State.ShowChangeImageModal = true;

    private void OpenGridSettingsModal() => State.ShowGridSettingsModal = true;

    private void CloseModals() {
        State.ShowChangeImageModal = false;
        State.ShowGridSettingsModal = false;
        State.ShowAssetSelectorModal = false;
    }

    private void StartAssetPlacement(AssetType assetType)
        => SelectedAsset!.Type = assetType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        if (e.Button == 2) { // Right mouse button
            await StartPanningAsync(e);
            return;
        }

        if (State.IsPanning) return;
        var position = GetMousePositionOnCanvas(e);
        if (position == null) return;
        if (SelectedAsset is not null && SelectedAsset.Type != AssetType.Placeholder) {
            SelectedAsset.Position = position.Value;
            State.ShowAssetSelectorModal = true;
            return;
        }

        TrySelectAssetAt(position.Value);
        await RenderAsync();
    }

    private SceneAssetDetails? FindAssetAt(Point absolutePointerPosition)
        => Scene is null
            ? null
            : SceneCalculations.FindAssetAt(absolutePointerPosition, Scene.Assets, _canvasPadding);

    private void TrySelectAssetAt(Point pointerPosition) {
        SelectedAsset = null;
        var asset = FindAssetAt(pointerPosition);
        if (asset == null)
            return;
        State.IsDragging = false;
        SelectedAsset = new() {
            Id = asset.Id,
            Number = asset.Number,
            Name = asset.Name,
            Type = asset.Type,
            Position = asset.Position,
            Size = asset.Size,
            Scale = asset.Scale,
            Rotation = asset.Rotation,
            Elevation = asset.Elevation,
            IsLocked = asset.IsLocked,
            ImageUrl = GetImageUrl(_assetBasePath, asset.ResourceType, asset.DisplayId),
        };
        State.IsDragging = SelectedAsset is { IsLocked: false };
    }

    private async Task OnCanvasMouseMove(MouseEventArgs e) {
        if (State.IsPanning) {
            await UpdatePanningAsync(e);
            return;
        }

        if (!State.IsDragging || SelectedAsset == null)
            return;

        if (_mouseMoveTimer != null)
            await _mouseMoveTimer.DisposeAsync();

        var position = GetMousePositionOnCanvas(e);
        if (position == null)
            return;

        UpdateAssetPosition(position.Value);
        _mouseMoveTimer = new(async void (_) => {
            try {
                await InvokeAsync(RenderAsync);
            }
            catch (Exception ex) {
                Console.Error.WriteLine(ex);
            }
        }, null, 16, Timeout.Infinite); // 16ms = ~60fps
    }

    private void UpdateAssetPosition(Point position) {
        if (Scene == null || SelectedAsset == null)
            return;
        SelectedAsset.Position = SceneCalculations.ApplyGridSnapping(position, State.Grid);
    }

    private async Task OnCanvasMouseUp(MouseEventArgs _) {
        if (State.IsPanning) {
            await EndPanningAsync();
            return;
        }
        State.IsDragging = false;
    }

    private async Task ZoomIn() => await JsRuntime.InvokeVoidAsync("setZoom", "+");

    private async Task ZoomOut() => await JsRuntime.InvokeVoidAsync("setZoom", "-");

    private async Task ZoomToFitHorizontally() => await JsRuntime.InvokeVoidAsync("setZoom", "H");
    
    private async Task ZoomToFitVertically() => await JsRuntime.InvokeVoidAsync("setZoom", "V");

    private async Task ResetZoom() => await JsRuntime.InvokeVoidAsync("setZoom", "X");

    private async Task StartPanningAsync(MouseEventArgs e) {
        if (State.IsZooming) return;
        State.IsPanning = true;
        State.HasMovedDuringPan = false;
        State.PanStartPosition = new((int)e.PageX, (int)e.PageY);
        State.InitialScrollPosition = await JsRuntime.InvokeAsync<Point>("getContainerScroll", _canvasContainerRef);
        await JsRuntime.InvokeVoidAsync("setCursor", _canvasContainerRef, "grabbing");
    }

    private async Task UpdatePanningAsync(MouseEventArgs e) {
        if (!State.IsPanning) return;
        var currentPosition = new Point((int)e.PageX, (int)e.PageY);
        var deltaX = currentPosition.X - State.PanStartPosition.X;
        var deltaY = currentPosition.Y - State.PanStartPosition.Y;

        State.HasMovedDuringPan = SceneCalculations.ExceedsMovementThreshold(State.PanStartPosition, currentPosition);
        var newPosition = new {
            x = State.InitialScrollPosition.X - deltaX,
            y = State.InitialScrollPosition.Y - deltaY
        };
        await JsRuntime.InvokeVoidAsync("setContainerScroll", _canvasContainerRef, newPosition);
        State.PanOffset = new(
            State.PanOffset.X + Math.Abs(deltaX),
            State.PanOffset.Y + Math.Abs(deltaY)
        );

        await StorageService.SaveStateAsync(State);
    }

    private async Task EndPanningAsync() {
        if (!State.IsPanning) return;
        State.IsPanning = false;
        await JsRuntime.InvokeVoidAsync("setCursor", _canvasContainerRef, "default");
    }

    private async Task OnCanvasContextMenu(MouseEventArgs e) {
        if (State is { IsPanning: true, HasMovedDuringPan: true }) return;
        var position = GetMousePositionOnCanvas(e);
        if (position == null) return;
        var asset = FindAssetAt(position.Value);
        if (asset == null || SelectedAsset == null) return;
        State.ContextMenuPosition = new() { X = Convert.ToInt32(e.ClientX), Y = Convert.ToInt32(e.ClientY) };
        State.ShowAssetContextMenu = true;
        await RenderAsync();
    }

    private Point? GetMousePositionOnCanvas(MouseEventArgs e) {
        try {
            var clientPosition = new Point((int)e.ClientX, (int)e.ClientY);
            return SceneCalculations.GetSceneMousePositionWithZoom(
                clientPosition,
                _canvasWindow!.Value,
                State.PanOffset,
                State.ZoomLevel,
                State.ZoomCenter
            );
        }
        catch (Exception ex) {
            Console.WriteLine($"Error calculating mouse position at [{e.ClientX}, {e.ClientY}]: {ex.Message}");
            return null;
        }
    }

    private void CloseContextMenu() => State.ShowAssetContextMenu = false;

    private async Task ToggleLockSelectedAsset() {
        if (Scene == null)
            return;
        if (SelectedAsset == null)
            return;

        SelectedAsset.IsLocked = !SelectedAsset.IsLocked;
        State.ShowAssetContextMenu = false;

        // Update the asset on the server
        var updateRequest = new UpdateAssetRequest {
            Name = SelectedAsset.Name,
            Position = SelectedAsset.Position,
            Scale = SelectedAsset.Scale,
            Rotation = SelectedAsset.Rotation,
            Elevation = SelectedAsset.Elevation,
            IsLocked = SelectedAsset.IsLocked,
        };

        await SceneBuilder.UpdateSceneAssetAsync(Scene!.Id, SelectedAsset.Id, SelectedAsset.Number, updateRequest);

        await RenderAsync();
    }

    private async Task DeleteSelectedAsset() {
        if (Scene == null)
            return;
        if (SelectedAsset == null)
            return;
        await SceneBuilder.RemoveSceneAssetAsync(Scene!.Id, SelectedAsset.Id, SelectedAsset.Number);

        Scene.Assets.RemoveAll(sa => sa.Id == SelectedAsset.Id && sa.Number == SelectedAsset.Number);
        SelectedAsset = null;
        State.ShowAssetContextMenu = false;
        await RenderAsync();
    }

    private void OnNewStageImageSelected(InputFileChangeEventArgs e) => SelectedStageFile = e.File;
    private void OnNewAssetImageSelected(InputFileChangeEventArgs e) => SelectedAssetFile = e.File;

    private static async Task<string> GetFileUrl(IBrowserFile file) {
        await using var stream = file.OpenReadStream(_maxFileSize);
        var bytes = new byte[stream.Length];
        var totalBytesRead = 0;
        while (totalBytesRead < bytes.Length) {
            var bytesRead = await stream.ReadAsync(bytes.AsMemory(totalBytesRead, bytes.Length - totalBytesRead));
            if (bytesRead == 0)
                break; // End of stream
            totalBytesRead += bytesRead;
        }
        if (totalBytesRead != bytes.Length)
            throw new IOException($"Failed to read file: read {totalBytesRead} of {bytes.Length} bytes");
        var content = Convert.ToBase64String(bytes);
        var fileType = file.ContentType;
        return $"data:{fileType};base64,{content}";
    }

    private async Task SaveBackgroundImage() {
        if (Scene == null || SelectedStageFile == null)
            return;
        var imageUrl = await GetFileUrl(SelectedStageFile);
        var imageSize = await JsRuntime.InvokeAsync<Size>("getImageSize", imageUrl);
        var fileName = Path.GetFileName(SelectedStageFile.Name);
        await using var stream = SelectedStageFile.OpenReadStream(_maxFileSize); // 10 MB
        var backgroundImageId = Guid.CreateVersion7();
        await SceneBuilder.UploadSceneFileAsync(backgroundImageId, stream, fileName);

        Scene = Scene with {
            Stage = Scene.Stage with {
                FileName = backgroundImageId.ToString(),
                Size = imageSize,
                Type = ResourceType.Image,
            },
        };
        await SaveScene();

        StageImageUrl = $"{_stageBasePath}/{backgroundImageId}.png";
        State.ShowChangeImageModal = false;
        await RenderAsync();
    }

    private async Task SaveGridSettings() {
        if (Scene == null)
            return;
        State.Grid = new GridDetails {
            Type = Input.Type,
            CellSize = new(Input.CellWidth, Input.CellHeight),
            Offset = new(Input.OffsetX, Input.OffsetY),
            Snap = Input.SnapToGrid,
        };
        await StorageService.SaveStateAsync(State);

        Scene = Scene with { Grid = State.Grid };
        await SaveScene();

        State.ShowGridSettingsModal = false;
        await RenderAsync();
    }

    private async Task AddAssetToScene() {
        if (Scene == null) return;
        if (SelectedAsset == null) return;
        var addAssetRequest = new AddAssetRequest {
            Id = SelectedAsset.Id,
            Name = SelectedAsset.Name,
            Position = SelectedAsset.Position,
            Scale = SelectedAsset.Scale,
            Rotation = SelectedAsset.Rotation,
            Elevation = SelectedAsset.Elevation,
        };

        var sceneAssetResult = await SceneBuilder.AddSceneAssetAsync(Scene!.Id, addAssetRequest);
        if (sceneAssetResult.IsSuccessful)
            Scene.Assets.Add(sceneAssetResult.Value);

        State.ShowAssetSelectorModal = false;
        SelectedAsset.Type = AssetType.Placeholder;
        SelectedAsset.Name = string.Empty;
        SelectedAsset.Position = new(0, 0);
        SelectedAsset.Scale = 1.0f;
        SelectedAsset.Rotation = 0.0f;
        SelectedAsset.Elevation = 0.0f;
        SelectedAssetFile = null;
        await RenderAsync();
    }

    private async Task SaveScene() {
        if (Scene == null) return;
        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Display = new Display {
                FileName = Scene.Stage.FileName ?? SceneId.ToString(),
                Type = Scene.Stage.Type,
                Size = Scene.Stage.Size,
            },
            ZoomLevel = Scene.ZoomLevel,
            Grid = new Grid {
                Type = Scene.Grid.Type,
                CellSize = Scene.Grid.CellSize,
                Offset = Scene.Grid.Offset,
                Snap = Scene.Grid.Snap,
            },
        };
        await SceneBuilder.UpdateSceneAsync(Scene.Id, updateRequest);
    }
}