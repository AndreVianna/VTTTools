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
    private GridInput _grid = new();
    private readonly AssetInput _asset = new();

    private Scene Scene { get; set; } = null!;
    private BuilderState State { get; set; } = new();

    // Base path for assets
    private string _canvasJs = string.Empty;
    private const string _assetBasePath = "/uploads/assets";
    private const string _stageBasePath = "/uploads/stage";

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await LoadSceneAsync();
    }

    protected override void OnParametersSet() {
        base.OnParametersSet();
        State.IsReady = true;
    }

    protected override async Task OnAfterRenderAsync(bool firstRender) {
        if (firstRender)
            await InitializeCanvasAsync();

        if (!string.IsNullOrEmpty(_canvasJs)) {
            await JsRuntime.InvokeVoidAsync("eval", _canvasJs);
            _canvasJs = string.Empty;
        }
    }

    private async Task LoadSceneAsync() {
        var scene = await LibraryClient.GetSceneByIdAsync(SceneId);
        if (scene == null) {
            NavigateBack();
            return;
        }
        _grid = new() {
            Type = scene.Stage.Grid.Type,
            CellWidth = scene.Stage.Grid.Cell.Scale.X * scene.Stage.Grid.Cell.Size,
            CellHeight = scene.Stage.Grid.Cell.Scale.Y * scene.Stage.Grid.Cell.Size,
            OffsetLeft = scene.Stage.Grid.Cell.Offset.X,
            OffsetTop = scene.Stage.Grid.Cell.Offset.Y,
        };

        State.BackgroundUrl = $"{_stageBasePath}/{Scene.Stage.Shape.SourceId ?? Scene.Id}.png";

        StateHasChanged();
        _canvasJs = GetCanvasInitializationJs();
    }

    private async Task InitializeCanvasAsync() {
        await JsRuntime.InvokeVoidAsync("initCanvas", _canvasRef, Scene.Stage.Shape.Size.X, Scene.Stage.Shape.Size.Y);
        await DrawSceneAsync();
    }

    private static string GetCanvasInitializationJs() => """
            window.initCanvas = function(canvas, width, height) {
                canvas.width = width || 1000;
                canvas.height = height || 800;
                const ctx = canvas.getContext('2d');

                // Store context and dimensions in global vars for later use
                window.sceneCanvasCtx = ctx;
                window.sceneCanvasWidth = canvas.width;
                window.sceneCanvasHeight = canvas.height;
            };

            window.drawScene = function(sceneData) {
                const ctx = window.sceneCanvasCtx;
                if (!ctx) return;

                // Clear the canvas
                ctx.clearRect(0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);

                // Draw background if there's a source
                if (sceneData.backgroundSrc) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0, window.sceneCanvasWidth, window.sceneCanvasHeight);

                        // Draw grid on top of background
                        if (sceneData.grid && sceneData.grid.type !== 0) { // 0 = NoGrid
                            drawGrid(sceneData.grid);
                        }

                        // Draw assets
                        if (sceneData.assets && sceneData.assets.length) {
                            drawAssets(sceneData.assets);
                        }
                    };
                    img.src = sceneData.backgroundSrc;
                } else {
                    // No background, draw grid and assets directly
                    if (sceneData.grid && sceneData.grid.type !== 0) {
                        drawGrid(sceneData.grid);
                    }

                    if (sceneData.assets && sceneData.assets.length) {
                        drawAssets(sceneData.assets);
                    }
                }
            };

            window.drawGrid = function(grid) {
                const ctx = window.sceneCanvasCtx;
                const width = window.sceneCanvasWidth;
                const height = window.sceneCanvasHeight;

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 1;

                const offsetX = grid.offset?.left || 0;
                const offsetY = grid.offset?.top || 0;
                const cellWidth = grid.cellSize?.width || 50;
                const cellHeight = grid.cellSize?.height || 50;

                switch(grid.type) {
                    case 1: // Square
                        // Draw vertical lines
                        for (let x = offsetX; x < width; x += cellWidth) {
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }

                        // Draw horizontal lines
                        for (let y = offsetY; y < height; y += cellHeight) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }
                        break;

                    case 2: // HexV
                    case 3: // HexH
                    case 4: // Isometric
                        // These grid types will be implemented later
                        ctx.font = '20px Arial';
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.fillText('Grid type not yet implemented', 20, 60);
                        break;
                }
            };

            window.drawAssets = function(assets) {
                const ctx = window.sceneCanvasCtx;

                assets.forEach(asset => {
                    // Draw a placeholder circle for assets without images
                    const x = asset.position?.left || 0;
                    const y = asset.position?.top || 0;
                    const scale = asset.scale || 1;
                    const size = 40 * scale; // Default size

                    if (asset.imageSrc) {
                        const img = new Image();
                        img.onload = function() {
                            ctx.drawImage(img, x - size/2, y - size/2, size, size);

                            // Draw border for selected asset
                            if (asset.isSelected) {
                                ctx.strokeStyle = 'rgba(0, 126, 255, 0.8)';
                                ctx.lineWidth = 2;
                                ctx.strokeRect(x - size/2 - 3, y - size/2 - 3, size + 6, size + 6);
                            }

                            // Draw lock icon if asset is locked
                            if (asset.isLocked) {
                                ctx.font = '16px Arial';
                                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                                ctx.fillText('🔒', x - 8, y - size/2 - 5);
                            }

                            // Draw asset name beneath
                            ctx.font = '12px Arial';
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.fillText(asset.name || 'Asset', x, y + size/2 + 15);
                        };
                        img.src = asset.imageSrc;
                    } else {
                        ctx.beginPath();
                        ctx.arc(x, y, size/2, 0, Math.PI * 2);
                        ctx.fillStyle = asset.color || 'rgba(100, 100, 100, 0.7)';
                        ctx.fill();

                        // Draw border for selected asset
                        if (asset.isSelected) {
                            ctx.strokeStyle = 'rgba(0, 126, 255, 0.8)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(x, y, size/2 + 3, 0, Math.PI * 2);
                            ctx.stroke();
                        }

                        // Draw lock icon if asset is locked
                        if (asset.isLocked) {
                            ctx.font = '16px Arial';
                            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                            ctx.fillText('🔒', x - 8, y - size/2 - 5);
                        }

                        // Draw asset name beneath
                        ctx.font = '12px Arial';
                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.fillText(asset.name || 'Asset', x, y + size/2 + 15);
                    }
                });
            };

            window.getCanvasMousePosition = function(canvas, evt) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                };
            };

            window.findAssetAt = function(x, y, assets) {
                // Check in reverse order (top-most asset first)
                for (let i = assets.length - 1; i >= 0; i--) {
                    const asset = assets[i];
                    const assetX = asset.position?.left || 0;
                    const assetY = asset.position?.top || 0;
                    const scale = asset.scale || 1;
                    const size = 40 * scale;

                    // Check if point is within asset bounds
                    const left = assetX - size/2;
                    const top = assetY - size/2;
                    const right = assetX + size/2;
                    const bottom = assetY + size/2;

                    if (x >= left && x <= right && y >= top && y <= bottom) {
                        return asset;
                    }
                }
                return null;
            };
            """;

    private async Task DrawSceneAsync() {
        var sceneData = new {
            backgroundSrc = State.BackgroundUrl,
            grid = new {
                type = _grid.Type,
                cellSize = new {
                    width = _grid.CellWidth,
                    height = _grid.CellHeight,
                },
                offset = new {
                    left = _grid.OffsetLeft,
                    top = _grid.OffsetTop,
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

    private void StartAssetPlacement(AssetType assetType) => _asset.Type = assetType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        // Get mouse position relative to canvas
        var pos = await JsRuntime.InvokeAsync<object>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // If we're in asset placement mode, remember position for when we add the asset
        if (_asset.Type != AssetType.Placeholder) {
            _asset.PositionX = x;
            _asset.PositionY = y;
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
        if (State.SnapToGrid && _grid.Type != GridType.NoGrid) {
            // Snap to nearest grid point
            var gridX = _grid.OffsetLeft;
            var gridY = _grid.OffsetTop;
            var cellWidth = _grid.CellWidth > 0 ? _grid.CellWidth : 50;
            var cellHeight = _grid.CellHeight > 0 ? _grid.CellHeight : 50;

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

    private void OnImageFileSelected(InputFileChangeEventArgs e) => _asset.SelectedImageFile = e.File;

    private void OnAssetFileSelected(InputFileChangeEventArgs e) => _asset.SelectedAssetFile = e.File;

    private async Task SaveBackgroundImage() {
        if (_asset.SelectedImageFile == null)
            return;
        // Create a new asset for the background image
        var createAssetRequest = new CreateAssetRequest {
            Name = $"Background for {Scene.Name}",
            Type = AssetType.Object,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        await using var stream = _asset.SelectedImageFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
        await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _asset.SelectedImageFile.Name);

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
                    Type = _grid.Type,
                    Cell = new () {
                        Scale = new() {
                            X = _grid.CellWidth / 50.0f,
                            Y = _grid.CellHeight / 50.0f,
                        },
                        Size = 50.0f,
                        Offset = new() {
                            X = _grid.OffsetLeft,
                            Y = _grid.OffsetTop,
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
            Name = _asset.Name,
            Type = _asset.Type,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        if (_asset.SelectedAssetFile != null) {
            await using var stream = _asset.SelectedAssetFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
            await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _asset.SelectedAssetFile.Name);
        }

        // Add the asset to the scene
        var addAssetRequest = new AddAssetRequest {
            AssetId = assetResult.Value.Id,
            Name = _asset.Name,
            Position = new Vector2 (_asset.PositionX, _asset.PositionY),
        };

        var sceneAssetResult = await LibraryClient.AddSceneAssetAsync(Scene.Id, addAssetRequest);

        if (sceneAssetResult.IsSuccessful) {
            // Add to our local scene data
            Scene.SceneAssets.Add(sceneAssetResult.Value);
        }

        State.ShowAssetSelectorModal = false;
        _asset.Type = AssetType.Placeholder;
        _asset.Name = string.Empty;
        _asset.SelectedAssetFile = null;

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