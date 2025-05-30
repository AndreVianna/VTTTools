using VttTools.WebApp.WebAssembly.Utilities;

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

    private PersistingComponentStateSubscription? _persistingSubscription;
    private bool _hasRestoredState;

    private const string _assetBasePath = "/uploads/assets";
    private const string _stageBasePath = "/uploads/stages";
    private const int _maxFileSize = 10 * 1024 * 1024; // 10 MB

    private static readonly Point _canvasPadding = new(200, 200);

    private bool _canvasReady;
    private ElementReference _canvasContainerRef;
    private bool _isDisposed;
    private Timer? _mouseMoveTimer;
    private IJSObjectReference? module;

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
        if (_mouseMoveTimer is not null) await _mouseMoveTimer.DisposeAsync();
        GC.SuppressFinalize(this);
        _isDisposed = true;
    }

    // Base path for assets
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _persistingSubscription = ApplicationState.RegisterOnPersisting(PersistSceneData);
        if (!_hasRestoredState && ApplicationState.TryTakeFromJson<SceneBuilderPersistedData>($"SceneBuilder_{SceneId}", out var persistedData) && persistedData != null) {
            _hasRestoredState = true;
            Scene = persistedData.Scene;
        }

        if (Scene == null && !OperatingSystem.IsBrowser()) await LoadSceneAsync();
        if (_canvasReady) await InitStage();
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
        if (!firstRender) return;
        module = await JsRuntime.InvokeAsync<IJSObjectReference>("import", "./Pages/Library/Scenes/SceneBuilderPage.razor.js");
        _canvasReady = true;
        if (Scene == null && OperatingSystem.IsBrowser())
            await LoadSceneAsync();
        await InitStage();
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
            await InvokeAsync(StateHasChanged);
        }
        catch (Exception ex) {
            Console.WriteLine($"Error loading scene: {ex.Message}");
        }
    }

    private async Task InitStage() {
        if (Scene is null) return;
        var stageData = new {
            id = Scene.Id,
            imageUrl = GetImageUrl(_stageBasePath, Scene.Stage.Type, Scene.Stage.FileName ?? Scene.Id.ToString()),
            size = Scene.Stage.Size,
            zoomLevel = Scene.Stage.ZoomLevel,
            grid = new {
                type = Scene.Grid.Type,
                cellSize = Scene.Grid.CellSize,
                offset = Scene.Grid.Offset,
                snap = Scene.Grid.Snap,
            },
            assets = Scene?.Assets.Select(a => new {
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

        await JsRuntime.InvokeVoidAsync("initStage", _canvasContainerRef, stageData);
    }

    private async Task DrawStageAsync() {
        if (Scene is null) return;
        var stageData = new {
            sceneId = Scene.Id,
            imageUrl = GetImageUrl(_stageBasePath, Scene.Stage.Type, Scene.Stage.FileName ?? Scene.Id.ToString()),
            size = Scene.Stage.Size,
            zoomLevel = Scene.Stage.ZoomLevel,
            grid = new {
                type = Scene.Grid.Type,
                cellSize = Scene.Grid.CellSize,
                offset = Scene.Grid.Offset,
                snap = Scene.Grid.Snap,
            },
            assets = Scene?.Assets.Select(a => new {
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

        await JsRuntime.InvokeVoidAsync("drawStage", stageData);
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
        var isPanning = await JsRuntime.InvokeAsync<bool>("isPanning");
        if (isPanning) return;

        var position = await GetValueMousePositionOrDefault(e);
        if (position == null) return;

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
        if (Scene is null) return null;
        var relativePointerPosition = absolutePointerPosition.RelativeTo(_canvasPadding);
        return (from asset in Scene.Assets.Reverse<SceneAssetDetails>()
                let size = new Point((int)Math.Round(asset.Size.Width * asset.Scale), (int)Math.Round(asset.Size.Height * asset.Scale))
                where relativePointerPosition.IsWithin(asset.Position, asset.Position.ShiftedBy(size))
                select asset).FirstOrDefault();
    }

    private void TrySelectAssetAt(Point pointerPosition) {
        SelectedAsset = null;
        var asset = FindAssetAt(pointerPosition);
        if (asset == null) return;
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
        var isPanning = await JsRuntime.InvokeAsync<bool>("isPanning");
        if (isPanning) return;
        if (!State.IsDragging || SelectedAsset == null) return;
        if (_mouseMoveTimer != null)
            await _mouseMoveTimer.DisposeAsync();
        var position = await GetValueMousePositionOrDefault(e);
        if (position == null)
            return;
        UpdateAssetPosition(position.Value);
        _mouseMoveTimer = new(async void (_) => await InvokeAsync(DrawStageAsync), null, 16, Timeout.Infinite); // 16ms = ~60fps
    }

    private void UpdateAssetPosition(Point position) {
        if (Scene == null || SelectedAsset == null) return;
        SelectedAsset.Position = Scene.Grid is { Type: GridType.Square, Snap: true }
            ? GridCalculations.SnapToGrid(position, Scene.Grid)
            : position;
    }

    private void OnCanvasMouseUp(MouseEventArgs _) => State.IsDragging = false;

    private async Task OnCanvasContextMenu(MouseEventArgs e) {
        var isPanning = await JsRuntime.InvokeAsync<bool>("isPanning");
        if (isPanning)
            return;

        var position = await GetValueMousePositionOrDefault(e);
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

    private async Task<Point?> GetValueMousePositionOrDefault(MouseEventArgs e) {
        try {
            var pos = await JsRuntime.InvokeAsync<object?>("getSceneMousePosition", [new { clientX = e.ClientX, clientY = e.ClientY }]);
            return TryReadPosition(pos, out var left, out var top)
                ? new(left, top)
                : null;
        }
        catch (Exception ex) {
            Console.WriteLine($"Error getting mouse position at [{e.ClientX}, {e.ClientY}]: {ex.Message}");
            return null;
        }
    }

    private static bool TryReadPosition(object? result, out int left, out int top) {
        left = 0;
        top = 0;
        return result is JsonElement pos &&
            pos.TryGetProperty("x", out var x) &&
           pos.TryGetProperty("y", out var y) &&
           x.ValueKind != JsonValueKind.Null &&
           y.ValueKind != JsonValueKind.Null &&
           x.TryGetInt32(out left) &&
           x.TryGetInt32(out top);
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
            if (bytesRead == 0) break; // End of stream
            totalBytesRead += bytesRead;
        }
        if (totalBytesRead != bytes.Length)
            throw new IOException($"Failed to read file: read {totalBytesRead} of {bytes.Length} bytes");
        var content = Convert.ToBase64String(bytes);
        var fileType = file.ContentType;
        return $"data:{fileType};base64,{content}";
    }

    private async Task SaveBackgroundImage() {
        if (Scene == null || SelectedStageFile == null) return;
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
        if (Scene == null) return;
        Scene = Scene with { Grid = new() {
            Type = Input.Type,
            CellSize = new(Input.CellWidth, Input.CellHeight),
            Offset = new(Input.OffsetX, Input.OffsetY),
            Snap = Input.SnapToGrid,
        } };
        await JsRuntime.InvokeVoidAsync("saveGridSettings", Scene.Grid);
        await SaveScene();

        State.ShowGridSettingsModal = false;
        await DrawStageAsync();
    }

    private async Task AddAssetToScene() {
        if (Scene == null) return;
        if (SelectedAsset == null) return;

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
