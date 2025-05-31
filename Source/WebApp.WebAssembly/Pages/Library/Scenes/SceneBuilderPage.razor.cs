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
    private Rectangle? _canvasRect;

    internal BuilderState State { get; set; } = new();
    internal GuidInput Input { get; set; } = new();
    internal SceneDetails? Scene { get; set; }
    internal string StageImageUrl { get; set; } = string.Empty;
    internal SelectedAsset? SelectedAsset { get; set; }
    public IBrowserFile? SelectedStageFile { get; set; }
    public IBrowserFile? SelectedAssetFile { get; set; }

    public async ValueTask DisposeAsync() {
        if (_isDisposed) return;
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

        if (Scene == null && !OperatingSystem.IsBrowser()) await LoadSceneAsync();
        if (_canvasReady) await InitStageAsync();
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
        await JsRuntime.InvokeVoidAsync("initStage", _canvasContainerRef, renderData);

        // Get canvas bounding rect for coordinate calculations
        await UpdateCanvasRectAsync();
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

    private async Task UpdateCanvasRectAsync() {
        try {
            var rect = await JsRuntime.InvokeAsync<object>("getCanvasBoundingRect", _canvasContainerRef);
            if (TryParseCanvasRect(rect, out var canvasRect)) {
                _canvasRect = canvasRect;
            }
        }
        catch (Exception ex) {
            Console.WriteLine($"Error getting canvas rect: {ex.Message}");
        }
    }

    private static bool TryParseCanvasRect(object? rect, out Rectangle canvasRect) {
        canvasRect = default;
        if (rect is not JsonElement element)
            return false;

        if (!element.TryGetProperty("left", out var left) ||
            !element.TryGetProperty("top", out var top) ||
            !element.TryGetProperty("width", out var width) ||
            !element.TryGetProperty("height", out var height) ||
            !left.TryGetInt32(out var leftVal) ||
            !top.TryGetInt32(out var topVal) ||
            !width.TryGetInt32(out var widthVal) ||
            !height.TryGetInt32(out var heightVal)) return false;

        canvasRect = new(leftVal, topVal, widthVal, heightVal);
        return true;
    }

    private object CreateRenderData() {
        if (Scene is null)
            return new { };

        return new {
            id = Scene.Id,
            imageUrl = GetImageUrl(_stageBasePath, Scene.Stage.Type, Scene.Stage.FileName ?? Scene.Id.ToString()),
            imageSize = Scene.Stage.Size,
            canvasSize = State.CanvasSize,
            zoomLevel = State.ZoomLevel,
            zoomCenter = State.ZoomCenter,
            offset = State.PanOffset,
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

    private async Task DrawStageAsync() {
        if (Scene is null)
            return;
        var renderData = CreateRenderData();
        await JsRuntime.InvokeVoidAsync("drawStage", renderData);
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

    private void StartAssetPlacement(AssetType assetType) => SelectedAsset!.Type = assetType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        // Check if we're in panning mode
        if (e.Button == 2) { // Right mouse button
            await StartPanningAsync(e);
            return;
        }

        if (State.IsPanning)
            return;

        var position = GetSceneMousePosition(e);
        if (position == null)
            return;

        // If we're in asset placement mode, remember position for when we add the asset
        if (SelectedAsset is not null && SelectedAsset.Type != AssetType.Placeholder) {
            SelectedAsset.Position = position.Value;
            State.ShowAssetSelectorModal = true;
            return;
        }

        TrySelectAssetAt(position.Value);
        await DrawStageAsync();
    }

    private SceneAssetDetails? FindAssetAt(Point absolutePointerPosition) {
        if (Scene is null)
            return null;
        return SceneCalculations.FindAssetAt(absolutePointerPosition, Scene.Assets, _canvasPadding);
    }

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

        var position = GetSceneMousePosition(e);
        if (position == null)
            return;

        UpdateAssetPosition(position.Value);
        _mouseMoveTimer = new(async void (_) => await InvokeAsync(DrawStageAsync), null, 16, Timeout.Infinite); // 16ms = ~60fps
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

    //private async Task ApplyZoomAsync(double deltaY, Point zoomCenter) {
    //    var zoomDirection = deltaY > 0 ? -1 : 1; // Negative deltaY = zoom in
    //    var newZoomLevel = State.ZoomLevel + (zoomDirection * BuilderState.ZoomStep);

    //    newZoomLevel = Math.Max(BuilderState.MinZoomLevel,
    //                   Math.Min(BuilderState.MaxZoomLevel, newZoomLevel));

    //    if (Math.Abs(newZoomLevel - State.ZoomLevel) < 0.01f)
    //        return; // No change needed

    //    State.ZoomLevel = newZoomLevel;
    //    State.ZoomCenter = zoomCenter;

    //    await StorageService.SaveStateAsync(State);
    //    await DrawStageAsync();
    //}

    private async Task ResetZoom() {
        await JsRuntime.InvokeVoidAsync("resetZoom");
    }

    private async Task StartPanningAsync(MouseEventArgs e) {
        if (State.IsZooming)
            return;

        State.IsPanning = true;
        State.HasMovedDuringPan = false;
        State.PanStartPosition = new((int)e.PageX, (int)e.PageY);

        // Get current scroll position from JavaScript
        var scrollPos = await JsRuntime.InvokeAsync<object>("getScrollPosition", _canvasContainerRef);
        if (TryParseScrollPosition(scrollPos, out var initialScroll)) {
            State.InitialScrollPosition = initialScroll;
        }

        await JsRuntime.InvokeVoidAsync("setCursor", _canvasContainerRef, "grabbing");
    }

    private async Task UpdatePanningAsync(MouseEventArgs e) {
        if (!State.IsPanning)
            return;

        var currentPosition = new Point((int)e.PageX, (int)e.PageY);
        var deltaX = currentPosition.X - State.PanStartPosition.X;
        var deltaY = currentPosition.Y - State.PanStartPosition.Y;

        State.HasMovedDuringPan = SceneCalculations.ExceedsMovementThreshold(
            State.PanStartPosition, currentPosition);

        var newScrollLeft = State.InitialScrollPosition.X - deltaX;
        var newScrollTop = State.InitialScrollPosition.Y - deltaY;

        await JsRuntime.InvokeVoidAsync("setScrollPosition", _canvasContainerRef,
            new { left = newScrollLeft, top = newScrollTop });

        State.PanOffset = new(
            State.PanOffset.X + Math.Abs(deltaX),
            State.PanOffset.Y + Math.Abs(deltaY)
        );

        await StorageService.SaveStateAsync(State);
    }

    private async Task EndPanningAsync() {
        if (!State.IsPanning)
            return;

        State.IsPanning = false;
        await JsRuntime.InvokeVoidAsync("setCursor", _canvasContainerRef, "default");
    }

    private static bool TryParseScrollPosition(object? scrollPos, out Point position) {
        position = default;
        if (scrollPos is not JsonElement element)
            return false;

        if (!element.TryGetProperty("left", out var left) ||
            !element.TryGetProperty("top", out var top) ||
            !left.TryGetInt32(out var leftVal) ||
            !top.TryGetInt32(out var topVal)) return false;
        position = new(leftVal, topVal);
        return true;
    }

    private async Task OnCanvasContextMenu(MouseEventArgs e) {
        if (State is { IsPanning: true, HasMovedDuringPan: true })
            return;

        var position = GetSceneMousePosition(e);
        if (position == null)
            return;

        var asset = FindAssetAt(position.Value);
        if (asset == null || SelectedAsset == null)
            return;

        // Show the context menu
        State.ContextMenuPosition = new() { X = Convert.ToInt32(e.ClientX), Y = Convert.ToInt32(e.ClientY) };
        State.ShowAssetContextMenu = true;
        await DrawStageAsync();
    }

    private Point? GetSceneMousePosition(MouseEventArgs e) {
        if (_canvasRect == null)
            return null;

        try {
            var clientPosition = new Point((int)e.ClientX, (int)e.ClientY);
            return SceneCalculations.GetSceneMousePositionWithZoom(
                clientPosition,
                _canvasRect.Value,
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

        await DrawStageAsync();
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
        await DrawStageAsync();
    }

    private void OnNewStageImageSelected(InputFileChangeEventArgs e) => SelectedStageFile = e.File;
    private void OnNewAssetImageSelected(InputFileChangeEventArgs e) => SelectedAssetFile = e.File;

    private static async Task<string> CreateObjectUrlForFile(IBrowserFile file) {
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
        var objectUrl = await CreateObjectUrlForFile(SelectedStageFile);
        var imageSize = await JsRuntime.InvokeAsync<Size>("getImageDimensionsFromUrl", objectUrl);
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
        await DrawStageAsync();
    }

    private async Task SaveGridSettings() {
        if (Scene == null)
            return;

        // Update both scene and state
        var newGrid = new GridDetails {
            Type = Input.Type,
            CellSize = new(Input.CellWidth, Input.CellHeight),
            Offset = new(Input.OffsetX, Input.OffsetY),
            Snap = Input.SnapToGrid,
        };

        Scene = Scene with { Grid = newGrid };
        State.Grid = newGrid;

        await StorageService.SaveStateAsync(State);
        await SaveScene();

        State.ShowGridSettingsModal = false;
        await DrawStageAsync();
    }

    private async Task AddAssetToScene() {
        if (Scene == null)
            return;
        if (SelectedAsset == null)
            return;

        // First, create a new asset
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
        await DrawStageAsync();
    }

    private async Task SaveScene() {
        if (Scene == null)
            return;
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