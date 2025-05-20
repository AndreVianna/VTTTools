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

    private Scene Scene { get; set; } = null!;
    private BuilderState State { get; set; } = new();
    private string _canvasJs = string.Empty;

    // Modal state
    private bool _showChangeImageModal;
    private bool _showGridSettingsModal;
    private bool _showAssetSelectorModal;
    private bool _showTokenContextMenu;
    private Vector2 _contextMenuPosition = new();

    // Base path for assets
    private const string _assetBasePath = "/uploads/assets";

    protected override Task OnInitializedAsync() => LoadSceneAsync();

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
            CellWidth = scene.Stage.Grid.CellSize.Width,
            CellHeight = scene.Stage.Grid.CellSize.Height,
            OffsetLeft = scene.Stage.Grid.Offset.X,
            OffsetTop = scene.Stage.Grid.Offset.Y,
        };

        StateHasChanged();
        _canvasJs = GetCanvasInitializationJs();
    }

    private async Task InitializeCanvasAsync() {
        await JsRuntime.InvokeVoidAsync("initCanvas", _canvasRef, Scene.Stage.Scale.Width, Scene.Stage.Scale.Height);
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

                        // Draw tokens
                        if (sceneData.tokens && sceneData.tokens.length) {
                            drawTokens(sceneData.tokens);
                        }
                    };
                    img.src = sceneData.backgroundSrc;
                } else {
                    // No background, draw grid and tokens directly
                    if (sceneData.grid && sceneData.grid.type !== 0) {
                        drawGrid(sceneData.grid);
                    }

                    if (sceneData.tokens && sceneData.tokens.length) {
                        drawTokens(sceneData.tokens);
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

            window.drawTokens = function(tokens) {
                const ctx = window.sceneCanvasCtx;

                tokens.forEach(token => {
                    // Draw a placeholder circle for tokens without images
                    const x = token.position?.left || 0;
                    const y = token.position?.top || 0;
                    const scale = token.scale || 1;
                    const size = 40 * scale; // Default size

                    if (token.imageSrc) {
                        const img = new Image();
                        img.onload = function() {
                            ctx.drawImage(img, x - size/2, y - size/2, size, size);

                            // Draw border for selected token
                            if (token.isSelected) {
                                ctx.strokeStyle = 'rgba(0, 126, 255, 0.8)';
                                ctx.lineWidth = 2;
                                ctx.strokeRect(x - size/2 - 3, y - size/2 - 3, size + 6, size + 6);
                            }

                            // Draw lock icon if token is locked
                            if (token.isLocked) {
                                ctx.font = '16px Arial';
                                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                                ctx.fillText('🔒', x - 8, y - size/2 - 5);
                            }

                            // Draw token name beneath
                            ctx.font = '12px Arial';
                            ctx.fillStyle = 'black';
                            ctx.textAlign = 'center';
                            ctx.fillText(token.name || 'Token', x, y + size/2 + 15);
                        };
                        img.src = token.imageSrc;
                    } else {
                        ctx.beginPath();
                        ctx.arc(x, y, size/2, 0, Math.PI * 2);
                        ctx.fillStyle = token.color || 'rgba(100, 100, 100, 0.7)';
                        ctx.fill();

                        // Draw border for selected token
                        if (token.isSelected) {
                            ctx.strokeStyle = 'rgba(0, 126, 255, 0.8)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(x, y, size/2 + 3, 0, Math.PI * 2);
                            ctx.stroke();
                        }

                        // Draw lock icon if token is locked
                        if (token.isLocked) {
                            ctx.font = '16px Arial';
                            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
                            ctx.fillText('🔒', x - 8, y - size/2 - 5);
                        }

                        // Draw token name beneath
                        ctx.font = '12px Arial';
                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.fillText(token.name || 'Token', x, y + size/2 + 15);
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

            window.findTokenAt = function(x, y, tokens) {
                // Check in reverse order (top-most token first)
                for (let i = tokens.length - 1; i >= 0; i--) {
                    const token = tokens[i];
                    const tokenX = token.position?.left || 0;
                    const tokenY = token.position?.top || 0;
                    const scale = token.scale || 1;
                    const size = 40 * scale;

                    // Check if point is within token bounds
                    const left = tokenX - size/2;
                    const top = tokenY - size/2;
                    const right = tokenX + size/2;
                    const bottom = tokenY + size/2;

                    if (x >= left && x <= right && y >= top && y <= bottom) {
                        return token;
                    }
                }
                return null;
            };
            """;

    private async Task DrawSceneAsync() {
        var sceneData = new {
            backgroundSrc = Scene.Stage.Source,
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
            tokens = Scene.SceneAssets.Select(a => new {
                id = a.Id,
                number = a.Number,
                name = a.Name,
                position = a.Position,
                scale = a.Scale,
                isLocked = a.IsLocked,
                isSelected = a == _selectedToken,
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

    private void OpenChangeImageModal() => _showChangeImageModal = true;

    private void OpenGridSettingsModal() => _showGridSettingsModal = true;

    private void CloseModals() {
        _showChangeImageModal = false;
        _showGridSettingsModal = false;
        _showAssetSelectorModal = false;
    }

    private void StartTokenPlacement(AssetType tokenType) => _tokenTypeToAdd = tokenType;// Will open asset selector when user clicks on canvas

    private async Task OnCanvasMouseDown(MouseEventArgs e) {
        // Get mouse position relative to canvas
        var pos = await JsRuntime.InvokeAsync<object>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // If we're in token placement mode, remember position for when we add the token
        if (_tokenTypeToAdd != AssetType.Placeholder) {
            _pendingTokenPosition = new() { Left = x, Top = y };
            _showAssetSelectorModal = true;
            return;
        }

        // Otherwise, try to select a token
        var tokenData = await JsRuntime.InvokeAsync<object>("findTokenAt", [ x, y, Scene.SceneAssets.Select(a => new {
            assetId = a.Id,
            number = a.Number,
            position = a.Position,
            scale = a.Scale,
            isLocked = a.IsLocked,
        }).ToArray() ]);

        _selectedToken = null;
        var assetId = Guid.Parse(((dynamic)tokenData).assetId.ToString());
        var number = Convert.ToUInt32(((dynamic)tokenData).number);

        // Find the token in our scene assets
        _selectedToken = Scene.SceneAssets.FirstOrDefault(a => a.Id == assetId && a.Number == number);

        _isDragging = _selectedToken is { IsLocked: false };

        await DrawSceneAsync();
    }

    private async Task OnCanvasMouseMove(MouseEventArgs e) {
        if (!_isDragging || _selectedToken == null)
            return;
        var pos = await JsRuntime.InvokeAsync<object>("getCanvasMousePosition", [_canvasRef, new { clientX = e.ClientX, clientY = e.ClientY }]);
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // Update token position
        if (_snapToGrid && _grid.Type != GridType.NoGrid) {
            // Snap to nearest grid point
            var gridX = _grid.OffsetLeft;
            var gridY = _grid.OffsetTop;
            var cellWidth = _grid.CellWidth > 0 ? _grid.CellWidth : 50;
            var cellHeight = _grid.CellHeight > 0 ? _grid.CellHeight : 50;

            // Calculate nearest grid point
            x = (Math.Round((x - gridX) / cellWidth) * cellWidth) + gridX;
            y = (Math.Round((y - gridY) / cellHeight) * cellHeight) + gridY;
        }

        _selectedToken = _selectedToken with { Position = new() { Left = x, Top = y } };
        await DrawSceneAsync();
    }

    private void OnCanvasMouseUp(MouseEventArgs _) => _isDragging = false;

    private Task OnCanvasContextMenu(MouseEventArgs e) {
        if (_selectedToken == null)
            return Task.CompletedTask;

        // Show context menu at mouse position
        _contextMenuPosition = new() { X = e.ClientX, Y = e.ClientY };
        _showTokenContextMenu = true;

        return DrawSceneAsync();
    }

    private void CloseContextMenu() => _showTokenContextMenu = false;

    private async Task ToggleLockSelectedToken() {
        if (_selectedToken == null)
            return;

        _selectedToken = _selectedToken with { IsLocked = !_selectedToken.IsLocked };
        _showTokenContextMenu = false;

        // Update the token on the server
        var updateRequest = new UpdateAssetRequest {
            AssetId = _selectedToken.Id,
            Number = _selectedToken.Number,
            Name = _selectedToken.Name,
            Position = _selectedToken.Position,
            Scale = _selectedToken.Scale,
            IsLocked = _selectedToken.IsLocked,
        };

        await LibraryClient.UpdateSceneAssetAsync(Scene.Id, _selectedToken.Id, _selectedToken.Number, updateRequest);

        await DrawSceneAsync();
    }

    private async Task DeleteSelectedToken() {
        if (_selectedToken == null)
            return;
        await LibraryClient.RemoveSceneAssetAsync(
                                                    Scene.Id, _selectedToken.Id, _selectedToken.Number);

        Scene.SceneAssets.Remove(_selectedToken);
        _selectedToken = null;
        _showTokenContextMenu = false;
        await DrawSceneAsync();
    }

    private void OnImageFileSelected(InputFileChangeEventArgs e) => _selectedImageFile = e.File;

    private void OnAssetFileSelected(InputFileChangeEventArgs e) => _selectedAssetFile = e.File;

    private async Task SaveBackgroundImage() {
        if (_selectedImageFile == null)
            return;
        // Create a new asset for the background image
        var createAssetRequest = new CreateAssetRequest {
            Name = $"Background for {Scene.Name}",
            Type = AssetType.Object,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        await using var stream = _selectedImageFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
        await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _selectedImageFile.Name);

        // Update the scene with the new background path
        Scene = Scene with { Stage = Scene.Stage with { Source = GetAssetPath(MediaType.Image, assetResult.Value.Id) } };

        var updateRequest = new UpdateSceneRequest {
            Name = Scene.Name,
            Description = Scene.Description,
            Stage = Scene.Stage,
        };

        await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);

        _showChangeImageModal = false;
        await DrawSceneAsync();
    }

    private async Task SaveGridSettings() {
        Scene = Scene with {
            Stage = Scene.Stage with {
                Grid = new() {
                    Type = _grid.Type,
                    CellSize = new() {
                        Width = _grid.CellWidth,
                        Height = _grid.CellHeight,
                    },
                    Offset = new() {
                        X = _grid.OffsetLeft,
                        Y = _grid.OffsetTop,
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

        _showGridSettingsModal = false;
        await DrawSceneAsync();
    }

    private async Task AddTokenToScene() {
        // First, create a new asset
        var createAssetRequest = new CreateAssetRequest {
            Name = _newAssetName,
            Type = _tokenTypeToAdd,
        };

        var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);

        if (!assetResult.IsSuccessful)
            return;

        if (_selectedAssetFile != null) {
            await using var stream = _selectedAssetFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
            await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _selectedAssetFile.Name);
        }

        // Add the asset to the scene
        var addAssetRequest = new AddAssetRequest {
            AssetId = assetResult.Value.Id,
            Name = _newAssetName,
            Position = _pendingTokenPosition,
            Scale = 1.0,
        };

        var sceneAssetResult = await LibraryClient.AddSceneAssetAsync(Scene.Id, addAssetRequest);

        if (sceneAssetResult.IsSuccessful) {
            // Add to our local scene data
            Scene.SceneAssets.Add(sceneAssetResult.Value);
        }

        _showAssetSelectorModal = false;
        _tokenTypeToAdd = AssetType.Placeholder;
        _newAssetName = string.Empty;
        _selectedAssetFile = null;

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