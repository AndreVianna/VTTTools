using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Client.Pages.Library.Scenes;

public partial class SceneBuilderPage : ComponentBase {
    [Parameter]
    public Guid SceneId { get; set; }

    [Inject]
    private ILibraryClient LibraryClient { get; set; } = null!;

    [Inject]
    private IAssetsClient AssetsClient { get; set; } = null!;

    [Inject]
    private IJSRuntime JsRuntime { get; set; } = null!;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private ElementReference _canvasRef;
    private ElementReference _canvasContainerRef;
    private const string _assetBasePath = "/uploads/assets";
    private const string _stageBasePath = "/uploads/stage";

    internal Scene Scene { get; set; } = null!;
    internal BuilderState State { get; set; } = new();
    internal GridInput Grid { get; set; } = new();
    internal AssetInput SelectedAsset { get; set; } = new();

    // Base path for assets
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await LoadSceneAsync();
    }

    protected override void OnParametersSet() {
        base.OnParametersSet();
        State.IsReady = true;
    }

    protected override Task OnAfterRenderAsync(bool firstRender)
        => firstRender
            ? InitializeCanvasAsync()
            : Task.CompletedTask;

    private async Task LoadSceneAsync() {
        var scene = await LibraryClient.GetSceneByIdAsync(SceneId);
        if (scene == null) {
            NavigateBack();
            return;
        }
        Grid = new() {
            Type = scene.Stage.Grid.Type,
            CellWidth = scene.Stage.Grid.Cell.Scale.X * scene.Stage.Grid.Cell.Size,
            CellHeight = scene.Stage.Grid.Cell.Scale.Y * scene.Stage.Grid.Cell.Size,
            OffsetLeft = scene.Stage.Grid.Cell.Offset.X,
            OffsetTop = scene.Stage.Grid.Cell.Offset.Y,
        };

        State.BackgroundUrl = $"{_stageBasePath}/{Scene.Stage.Shape.SourceId ?? Scene.Id}.png";

        StateHasChanged();
    }

    private async Task InitializeCanvasAsync() {
        await JsRuntime.InvokeVoidAsync("initCanvas", _canvasRef, Scene.Stage.Shape.Size.X, Scene.Stage.Shape.Size.Y);
        await DrawSceneAsync();
    }

    private async Task DrawSceneAsync() {
        var sceneData = new {
            backgroundSrc = State.BackgroundUrl,
            grid = new {
                type = Grid.Type,
                cellSize = new {
                    width = Grid.CellWidth,
                    height = Grid.CellHeight,
                },
                offset = new {
                    left = Grid.OffsetLeft,
                    top = Grid.OffsetTop,
                },
            },
            assets = Scene.SceneAssets.Select(a => new {
                id = a.Id,
                number = a.Number,
                name = a.Name,
                position = a.Position,
                scale = a.Scale,
                isLocked = a.IsLocked,
                isSelected = a == State.SelectedAsset,
                imageSrc = GetAssetPath(a.Shape.Type, a.Shape.SourceId ?? a.Id),
                color = GetColorForAssetType(a.Type),
            }).ToArray(),
        };

        await JsRuntime.InvokeVoidAsync("drawScene", sceneData);
    }

    private static string GetAssetPath(MediaType fileType, Guid assetId) {
        var extension = GetFileExtension(fileType);
        return $"{_assetBasePath}/{fileType}/{assetId}{extension}";
    }

    private static string GetFileExtension(MediaType fileType)
        => fileType switch {
            MediaType.Image => ".png",
            MediaType.Audio => ".mp3",
            MediaType.Video => ".mp4",
            _ => throw new NotSupportedException($"File type {fileType} is not supported."),
        };

    private static string GetColorForAssetType(AssetType type) => type switch {
        AssetType.Character => "rgba(0, 128, 255, 0.7)",
        AssetType.NPC => "rgba(0, 200, 0, 0.7)",
        AssetType.Creature => "rgba(255, 0, 0, 0.7)",
        AssetType.Object => "rgba(128, 128, 128, 0.7)",
        _ => "rgba(100, 100, 100, 0.7)",
    };

    private void OpenChangeImageModal() => State.ShowChangeImageModal = true;

    private void OpenGridSettingsModal() => State.ShowGridSettingsModal = true;

    private void CloseModals() {
        State.ShowChangeImageModal = false;
        State.ShowGridSettingsModal = false;
        State.ShowAssetSelectorModal = false;
    }

    private void StartAssetPlacement(AssetType assetType) => SelectedAsset.Type = assetType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        // Get mouse position relative to canvas
        var pos = await JsRuntime.InvokeAsync<object>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // If we're in asset placement mode, remember position for when we add the asset
        if (SelectedAsset.Type != AssetType.Placeholder) {
            SelectedAsset.PositionX = x;
            SelectedAsset.PositionY = y;
            State.ShowAssetSelectorModal = true;
            return;
        }

        // Otherwise, try to select an asset
        var assetData = await JsRuntime.InvokeAsync<object>("findAssetAt", [ x, y, Scene.SceneAssets.Select(a => new {
            assetId = a.Id,
            number = a.Number,
            position = a.Position,
            scale = a.Scale,
            isLocked = a.IsLocked,
        }).ToArray() ]);

        State.SelectedAsset = null;
        var assetId = Guid.Parse(((dynamic)assetData).assetId.ToString());
        var number = Convert.ToUInt32(((dynamic)assetData).number);

        State.SelectedAsset = Scene.SceneAssets.FirstOrDefault(a => a.Id == assetId && a.Number == number);
        State.IsDragging = State.SelectedAsset is { IsLocked: false };

        await DrawSceneAsync();
    }

    private async Task OnCanvasMouseMove(MouseEventArgs e) {
        if (!State.IsDragging || State.SelectedAsset == null)
            return;
        var pos = await JsRuntime.InvokeAsync<object>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // Update asset position
        if (State.SnapToGrid && Grid.Type != GridType.NoGrid) {
            // Snap to nearest grid point
            var gridX = Grid.OffsetLeft;
            var gridY = Grid.OffsetTop;
            var cellWidth = Grid.CellWidth > 0 ? Grid.CellWidth : 50;
            var cellHeight = Grid.CellHeight > 0 ? Grid.CellHeight : 50;

            // Calculate nearest grid point
            x = (Math.Round((x - gridX) / cellWidth) * cellWidth) + gridX;
            y = (Math.Round((y - gridY) / cellHeight) * cellHeight) + gridY;
        }

        State.SelectedAsset = State.SelectedAsset with { Position = new() { X = x, Y = y } };
        await DrawSceneAsync();
    }

    private void OnCanvasMouseUp(MouseEventArgs _) => State.IsDragging = false;

    private Task OnCanvasContextMenu(MouseEventArgs e) {
        if (State.SelectedAsset == null)
            return Task.CompletedTask;

        // Show context menu at mouse position
        State.ContextMenuPosition = new() { X = Convert.ToSingle(e.ClientX), Y = Convert.ToSingle(e.ClientY) };
        State.ShowAssetContextMenu = true;

        return DrawSceneAsync();
    }

    private void CloseContextMenu() => State.ShowAssetContextMenu = false;

    private async Task ToggleLockSelectedAsset() {
        if (State.SelectedAsset == null)
            return;

        State.SelectedAsset = State.SelectedAsset with { IsLocked = !State.SelectedAsset.IsLocked };
        State.ShowAssetContextMenu = false;

        // Update the asset on the server
        var updateRequest = new UpdateAssetRequest {
            AssetId = State.SelectedAsset.Id,
            Number = State.SelectedAsset.Number,
            Name = State.SelectedAsset.Name,
            Position = State.SelectedAsset.Position,
            Scale = State.SelectedAsset.Scale,
            IsLocked = State.SelectedAsset.IsLocked,
        };

        await LibraryClient.UpdateSceneAssetAsync(Scene.Id, State.SelectedAsset.Id, State.SelectedAsset.Number, updateRequest);

        await DrawSceneAsync();
    }

    private async Task DeleteSelectedAsset() {
        if (State.SelectedAsset == null)
            return;
        await LibraryClient.RemoveSceneAssetAsync(Scene.Id, State.SelectedAsset.Id, State.SelectedAsset.Number);

        Scene.SceneAssets.Remove(State.SelectedAsset);
        State.SelectedAsset = null;
        State.ShowAssetContextMenu = false;
        await DrawSceneAsync();
    }

    private void OnImageFileSelected(InputFileChangeEventArgs e) => SelectedAsset.SelectedImageFile = e.File;

    private void OnAssetFileSelected(InputFileChangeEventArgs e) => SelectedAsset.SelectedAssetFile = e.File;

    private async Task SaveBackgroundImage() {
        if (SelectedAsset.SelectedImageFile == null)
            return;
        // Create a new asset for the background image
        var createAssetRequest = new CreateAssetRequest {
            Name = $"Background for {Scene.Name}",
            Type = AssetType.Object,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        await using var stream = SelectedAsset.SelectedImageFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
        await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, SelectedAsset.SelectedImageFile.Name);

        // Update the scene with the new background path
        Scene = Scene with { Stage = Scene.Stage with { Shape = Scene.Stage.Shape with { SourceId = assetResult.Value.Id } } };
        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Stage = Scene.Stage,
        };

        await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);

        State.ShowChangeImageModal = false;
        await DrawSceneAsync();
    }

    private async Task SaveGridSettings() {
        Scene = Scene with {
            Stage = Scene.Stage with {
                Grid = new() {
                    Type = Grid.Type,
                    Cell = new () {
                        Scale = new() {
                            X = Grid.CellWidth / 50.0f,
                            Y = Grid.CellHeight / 50.0f,
                        },
                        Size = 50.0f,
                        Offset = new() {
                            X = Grid.OffsetLeft,
                            Y = Grid.OffsetTop,
                        },
                    },
                },
            },
        };

        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Stage = Scene.Stage,
        };

        await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);

        State.ShowGridSettingsModal = false;
        await DrawSceneAsync();
    }

    private async Task AddAssetToScene() {
        // First, create a new asset
        var createAssetRequest = new CreateAssetRequest {
            Name = SelectedAsset.Name,
            Type = SelectedAsset.Type,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        if (SelectedAsset.SelectedAssetFile != null) {
            await using var stream = SelectedAsset.SelectedAssetFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
            await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, SelectedAsset.SelectedAssetFile.Name);
        }

        // Add the asset to the scene
        var addAssetRequest = new AddAssetRequest {
            AssetId = assetResult.Value.Id,
            Name = SelectedAsset.Name,
            Position = new Vector2 (SelectedAsset.PositionX, SelectedAsset.PositionY),
        };

        var sceneAssetResult = await LibraryClient.AddSceneAssetAsync(Scene.Id, addAssetRequest);

        if (sceneAssetResult.IsSuccessful) {
            // Add to our local scene data
            Scene.SceneAssets.Add(sceneAssetResult.Value);
        }

        State.ShowAssetSelectorModal = false;
        SelectedAsset.Type = AssetType.Placeholder;
        SelectedAsset.Name = string.Empty;
        SelectedAsset.SelectedAssetFile = null;

        await DrawSceneAsync();
    }

    private async Task SaveScene() {
        // Update the scene on the server
        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Stage = Scene.Stage,
        };

        await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);

        NavigateBack();
    }

    private void NavigateBack() => NavigationManager.NavigateTo("/adventures");
}