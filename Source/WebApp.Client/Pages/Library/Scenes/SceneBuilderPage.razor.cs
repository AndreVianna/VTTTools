using UpdateAssetRequest = VttTools.Library.Scenes.ApiContracts.UpdateAssetRequest;

namespace VttTools.WebApp.Client.Pages.Library.Scenes;

public partial class SceneBuilderPage : ComponentBase {
    [Parameter]
    public Guid SceneId { get; set; }

    [Inject]
    private ILibraryClientHttpClient LibraryClientHttpClient { get; set; } = null!;

    [Inject]
    private IAssetsClientHttpClient AssetsClientHttpClient { get; set; } = null!;

    [Inject]
    private IJSRuntime JsRuntime { get; set; } = null!;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private readonly ElementReference _canvasRef;
    private ElementReference _canvasContainerRef;
    private const string _assetBasePath = "/uploads/assets";
    private const string _stageBasePath = "/uploads/stages";
    private IBrowserFile? _selectedBackgroundFile;

    internal Scene? Scene { get; set; }
    internal BuilderState State { get; set; } = new();
    internal StageInput Stage { get; set; } = new();
    internal GridInput Grid { get; set; } = new();
    internal AssetInput? SelectedAsset { get; set; } = new();

    private object SceneAssets => Scene?.SceneAssets.Select(a => new {
        assetId = a.Id,
        number = a.Number,
        position = a.Position,
        scale = a.Scale,
        isLocked = a.IsLocked,
    }).ToArray() ?? [];

    // Base path for assets
    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        Stage = new() {
            ImageUrl = $"{_stageBasePath}/1309dbfb-0721-4809-a0ae-173019591f85.png",
            Width = 2800,
            Height = 2100,
        };
        Grid = new() {
            Type = GridType.NoGrid,
            CellWidth = 50,
            CellHeight = 50,
            OffsetLeft = 0,
            OffsetTop = 0,
        };
        await LoadSceneAsync();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender) {
        if (!firstRender)
            return;
        await InitializeCanvasAsync();
    }

    private async Task LoadSceneAsync() {
        var scene = await LibraryClientHttpClient.GetSceneByIdAsync(SceneId);
        if (scene == null)
            return;
        Scene = scene;
        Grid = new() {
            Type = Scene.Stage.Grid.Type,
            CellWidth = Scene.Stage.Grid.Cell.Scale.X * scene.Stage.Grid.Cell.Size,
            CellHeight = Scene.Stage.Grid.Cell.Scale.Y * scene.Stage.Grid.Cell.Size,
            OffsetLeft = Scene.Stage.Grid.Cell.Offset.X,
            OffsetTop = Scene.Stage.Grid.Cell.Offset.Y,
        };

        Stage = new() {
            ImageUrl = $"{_stageBasePath}/{Scene.Stage.Shape.SourceId ?? Scene.Id}.png",
            Width = Convert.ToInt32(Scene.Stage.Shape.Size.X),
            Height = Convert.ToInt32(Scene.Stage.Shape.Size.Y),
        };

        await InvokeAsync(StateHasChanged);
    }

    private async Task InitializeCanvasAsync() {
        await JsRuntime.InvokeVoidAsync("initCanvas", _canvasContainerRef, Stage.Width, Stage.Height);
        await DrawSceneAsync();
    }

    private async Task DrawSceneAsync() {
        var sceneData = new {
            imageUrl = Stage.ImageUrl,
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
            assets = Scene?.SceneAssets.Select(a => new {
                id = a.Id,
                number = a.Number,
                name = a.Name,
                position = a.Position,
                scale = a.Scale,
                isLocked = a.IsLocked,
                isSelected = a.Id == SelectedAsset?.Id,
                imageSrc = GetAssetPath(a.Shape.Type, a.Shape.SourceId ?? a.Id),
                color = GetColorForAssetType(a.Type),
            }).ToArray() ?? [],
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

    private void StartAssetPlacement(AssetType assetType) => SelectedAsset!.Type = assetType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        var position = await GetValueMousePositionOrDefault(e);
        if (position == null) return;

        // If we're in asset placement mode, remember position for when we add the asset
        if (SelectedAsset is not null && SelectedAsset.Type != AssetType.Placeholder) {
            SelectedAsset.PositionX = position.Value.X;
            SelectedAsset.PositionY = position.Value.Y;
            State.ShowAssetSelectorModal = true;
            return;
        }

        await TrySelectAssetAt(position.Value.X, position.Value.Y);
        await DrawSceneAsync();
    }

    private async Task TrySelectAssetAt(float x, float y) {
        SelectedAsset = null;
        var assetData = await JsRuntime.InvokeAsync<object?>("findAssetAt", [x, y, SceneAssets]);
        if (assetData == null)
            return;

        State.IsDragging = false;
        var assetElement = (JsonElement)assetData;
        if (assetElement.ValueKind == JsonValueKind.Null)
            return;

        var assetId = Guid.Parse(assetElement.GetProperty("assetId").ToString());
        var number = Convert.ToUInt32(assetElement.GetProperty("number").GetDouble());

        var selectedAsset = Scene?.SceneAssets.FirstOrDefault(a => a.Id == assetId && a.Number == number);
        if (selectedAsset == null)
            return;

        SelectedAsset = new() {
            Id = selectedAsset.Id,
            Number = selectedAsset.Number,
            Name = selectedAsset.Name,
            Type = selectedAsset.Type,
            PositionX = selectedAsset.Position.X,
            PositionY = selectedAsset.Position.Y,
            SizeX = selectedAsset.Shape.Size.X,
            ScaleX = selectedAsset.Scale.X,
            SizeY = selectedAsset.Shape.Size.Y,
            ScaleY = selectedAsset.Scale.Y,
            Rotation = selectedAsset.Rotation,
            Elevation = selectedAsset.Elevation,
            IsLocked = selectedAsset.IsLocked,
            MediaType = selectedAsset.Shape.Type,
            SourceId = selectedAsset.Shape.SourceId ?? selectedAsset.Id,
        };
        State.IsDragging = SelectedAsset is { IsLocked: false };
    }

    private async Task OnCanvasMouseMove(MouseEventArgs e) {
        if (!State.IsDragging || SelectedAsset == null)
            return;

        // Get mouse position relative to canvas
        var position = await GetValueMousePositionOrDefault(e);
        if (position == null) return;

        // Update asset position
        if (State.SnapToGrid && Grid.Type != GridType.NoGrid) {
            // Snap to nearest grid point
            var gridX = Grid.OffsetLeft;
            var gridY = Grid.OffsetTop;
            var cellWidth = Grid.CellWidth > 0 ? Grid.CellWidth : 50;
            var cellHeight = Grid.CellHeight > 0 ? Grid.CellHeight : 50;

            // Calculate nearest grid point
            position = position.Value with { X = (float)((Math.Round((position.Value.X - gridX) / cellWidth) * cellWidth) + gridX) };
            position = position.Value with { Y = (float)((Math.Round((position.Value.Y - gridY) / cellHeight) * cellHeight) + gridY) };
        }

        SelectedAsset.PositionX = position.Value.X;
        SelectedAsset.PositionY = position.Value.Y;
        await DrawSceneAsync();
    }

    private void OnCanvasMouseUp(MouseEventArgs _) => State.IsDragging = false;

    private async Task OnCanvasContextMenu(MouseEventArgs e) {
        var wasPanning = await JsRuntime.InvokeAsync<bool>("wasPanning");
        if (wasPanning) return;

        var position = await GetValueMousePositionOrDefault(e);
        if (position == null) return;

        var assetData = await JsRuntime.InvokeAsync<object?>("findAssetAt", [position.Value.X, position.Value.Y, SceneAssets]);
        if (assetData == null || SelectedAsset == null) return;

        // Show the context menu
        State.ContextMenuPosition = new() { X = Convert.ToSingle(e.ClientX), Y = Convert.ToSingle(e.ClientY) };
        State.ShowAssetContextMenu = true;
        await DrawSceneAsync();
    }

    private async Task<Vector2?> GetValueMousePositionOrDefault(MouseEventArgs e)
    {
        var pos = await JsRuntime.InvokeAsync<object?>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        if (pos == null) return null;
        var posElement = (JsonElement)pos;
        if (!posElement.TryGetProperty("x", out var xElement) ||
            !posElement.TryGetProperty("y", out var yElement) ||
            xElement.ValueKind == JsonValueKind.Null ||
            yElement.ValueKind == JsonValueKind.Null) {
            return null;
        }
        var x = xElement.GetSingle();
        var y = yElement.GetSingle();
        return new(x, y);
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
            Position = new Vector2(SelectedAsset.PositionX, SelectedAsset.PositionY),
            Scale = new Vector2(SelectedAsset.ScaleX, SelectedAsset.ScaleY),
            Rotation = SelectedAsset.Rotation,
            Elevation = SelectedAsset.Elevation,
            IsLocked = SelectedAsset.IsLocked,
        };

        await LibraryClientHttpClient.UpdateSceneAssetAsync(Scene!.Id, SelectedAsset.Id, SelectedAsset.Number, updateRequest);

        await DrawSceneAsync();
    }

    private async Task DeleteSelectedAsset() {
        if (Scene == null)
            return;
        if (SelectedAsset == null)
            return;
        await LibraryClientHttpClient.RemoveSceneAssetAsync(Scene!.Id, SelectedAsset.Id, SelectedAsset.Number);

        Scene.SceneAssets.RemoveAll(sa => sa.Id == SelectedAsset.Id && sa.Number == SelectedAsset.Number);
        SelectedAsset = null;
        State.ShowAssetContextMenu = false;
        await DrawSceneAsync();
    }

    private void OnNewStageImageSelected(InputFileChangeEventArgs e) => _selectedBackgroundFile = e.File;
    private void OnNewAssetImageSelected(InputFileChangeEventArgs e) => SelectedAsset!.SelectedAssetFile = e.File;

    private async Task SaveBackgroundImage() {
        if (Scene == null)
            return;
        if (_selectedBackgroundFile == null)
            return;

        var fileName = Path.GetFileName(_selectedBackgroundFile.Name);
        await using var stream = _selectedBackgroundFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
        var backgroundImageId = Guid.CreateVersion7();
        await AssetsClientHttpClient.UploadAssetFileAsync(backgroundImageId, stream, fileName);

        Scene = Scene with {
            Stage = Scene.Stage with {
                Shape = Scene.Stage.Shape with {
                    SourceId = backgroundImageId,
                },
            },
        };
        await SaveScene();

        Stage.ImageUrl = $"{_stageBasePath}/{backgroundImageId}.png";
        State.ShowChangeImageModal = false;
        await DrawSceneAsync();
    }

    private async Task SaveGridSettings() {
        if (Scene == null)
            return;
        Scene = Scene! with {
            Stage = Scene.Stage with {
                Grid = new() {
                    Type = Grid.Type,
                    Cell = new() {
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

        await SaveScene();

        State.ShowGridSettingsModal = false;
        await DrawSceneAsync();
    }

    private async Task AddAssetToScene() {
        if (Scene == null)
            return;
        if (SelectedAsset == null)
            return;

        // First, create a new asset
        var createAssetRequest = new CreateAssetRequest {
            Name = SelectedAsset.Name,
            Type = SelectedAsset.Type,
        };

        var assetResult = await AssetsClientHttpClient.CreateAssetAsync(createAssetRequest);
        if (!assetResult.IsSuccessful)
            return;
        if (SelectedAsset.SelectedAssetFile != null) {
            await using var stream = SelectedAsset.SelectedAssetFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
            await AssetsClientHttpClient.UploadAssetFileAsync(assetResult.Value.Id, stream, SelectedAsset.SelectedAssetFile.Name);
        }

        // Add the asset to the scene
        var addAssetRequest = new AddAssetRequest {
            AssetId = assetResult.Value.Id,
            Name = SelectedAsset.Name,
            Position = new Vector2(SelectedAsset.PositionX, SelectedAsset.PositionY),
        };

        var sceneAssetResult = await LibraryClientHttpClient.AddSceneAssetAsync(Scene!.Id, addAssetRequest);

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
        if (Scene == null)
            return;
        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Stage = Scene.Stage,
        };
        await LibraryClientHttpClient.UpdateSceneAsync(Scene.Id, updateRequest);
    }
}