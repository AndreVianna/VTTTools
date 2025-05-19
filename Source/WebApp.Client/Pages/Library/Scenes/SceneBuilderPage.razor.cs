using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Components.Web;
using VttTools.Assets.ApiContracts;
using VttTools.Assets.Model;
using VttTools.Common.Model;
using VttTools.Library.Scenes.ApiContracts;
using VttTools.Library.Scenes.Model;
using VttTools.WebApp.Client.Clients;
using VttTools.WebApp.Client.Models;

namespace VttTools.WebApp.Client.Pages.Library.Scenes;

public partial class SceneBuilderPage : ComponentBase
{
    [Parameter]
    public Guid SceneId { get; set; }

    [Inject]
    private ILibraryClient LibraryClient { get; set; } = null!;

    [Inject]
    private IAssetsClient AssetsClient { get; set; } = null!;

    [Inject]
    private IJSRuntime JSRuntime { get; set; } = null!;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    private ElementReference CanvasRef;
    private ElementReference CanvasContainerRef;
    private Scene? Scene { get; set; }
    private Grid GridSettings { get; set; } = new Grid();
    private bool _snapToGrid = true;
    private bool _isDragging;
    private SceneAsset? _selectedToken;
    private AssetType _tokenTypeToAdd;
    private Position _pendingTokenPosition = new();
    private IBrowserFile? _selectedImageFile;
    private IBrowserFile? _selectedAssetFile;
    private string _newAssetName = string.Empty;
    private string _canvasJS = string.Empty;

    // Modal state
    private bool _showChangeImageModal;
    private bool _showGridSettingsModal;
    private bool _showAssetSelectorModal;
    private bool _showTokenContextMenu;
    private Position _contextMenuPosition = new();

    // Base path for assets
    private const string AssetBasePath = "/uploads/assets";

    protected override async Task OnInitializedAsync()
    {
        await LoadSceneAsync();
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await InitializeCanvasAsync();
        }

        if (!string.IsNullOrEmpty(_canvasJS))
        {
            await JSRuntime.InvokeVoidAsync("eval", new object[] { _canvasJS });
            _canvasJS = string.Empty;
        }
    }

    private async Task LoadSceneAsync()
    {
        try
        {
            Scene = await LibraryClient.GetSceneByIdAsync(SceneId);
            if (Scene != null)
            {
                GridSettings = Scene.Stage.Grid;
                StateHasChanged();

                // Generate JS to initialize canvas with scene data
                _canvasJS = GetCanvasInitializationJS();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading scene: {ex.Message}");
            // In a real app, handle the error appropriately
        }
    }

    private async Task InitializeCanvasAsync()
    {
        if (Scene == null) return;

        // Set the canvas size based on stage dimensions
        await JSRuntime.InvokeVoidAsync("initCanvas", new object[] { CanvasRef, Scene.Stage.Size.Width, Scene.Stage.Size.Height });

        // Draw the scene
        await DrawSceneAsync();
    }

    private string GetCanvasInitializationJS()
    {
        if (Scene == null) return string.Empty;

        return @"
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
                        if (sceneData.grid && sceneData.grid.type !== 0) { // 0 = None
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
        ";
    }

    private async Task DrawSceneAsync()
    {
        if (Scene == null) return;

        var sceneData = new
        {
            backgroundSrc = Scene.Stage.Source,
            grid = GridSettings,
            tokens = Scene.SceneAssets.Select(a => new
            {
                id = a.AssetId,
                number = a.Number,
                name = a.Name,
                position = a.Position,
                scale = a.Scale,
                isLocked = a.IsLocked,
                isSelected = a == _selectedToken,
                imageSrc = GetAssetPath(a.Asset?.Type ?? AssetType.Object, a.Asset?.Format?.SourceId ?? a.AssetId),
                color = GetColorForAssetType(a.Asset?.Type ?? AssetType.Object)
            }).ToArray()
        };

        await JSRuntime.InvokeVoidAsync("drawScene", new object[] { sceneData });
    }

    private string GetAssetPath(AssetType assetType, Guid assetId)
    {
        string extension = GetFileExtension(assetType);
        return $"{AssetBasePath}/{assetType}/{assetId}{extension}";
    }

    private string GetFileExtension(AssetType assetType)
    {
        return assetType switch
        {
            AssetType.Character => ".png",
            AssetType.NPC => ".png",
            AssetType.Creature => ".png",
            AssetType.Object => ".png",
            AssetType.Overlay => ".png",
            AssetType.Wall => ".png",
            AssetType.Elevation => ".png",
            AssetType.Effect => ".png",
            AssetType.Placeholder => ".png",
            _ => ".png"
        };
    }

    private string GetColorForAssetType(AssetType type)
    {
        return type switch
        {
            AssetType.Character => "rgba(0, 128, 255, 0.7)",
            AssetType.NPC => "rgba(0, 200, 0, 0.7)",
            AssetType.Creature => "rgba(255, 0, 0, 0.7)",
            AssetType.Object => "rgba(128, 128, 128, 0.7)",
            _ => "rgba(100, 100, 100, 0.7)"
        };
    }

    private void OpenChangeImageModal()
    {
        _showChangeImageModal = true;
    }

    private void OpenGridSettingsModal()
    {
        _showGridSettingsModal = true;
    }

    private void CloseModals()
    {
        _showChangeImageModal = false;
        _showGridSettingsModal = false;
        _showAssetSelectorModal = false;
    }

    private void StartTokenPlacement(AssetType tokenType)
    {
        _tokenTypeToAdd = tokenType;
        // Will open asset selector when user clicks on canvas
    }

    private async Task OnCanvasMouseDown(MouseEventArgs e)
    {
        if (Scene == null) return;

        // Get mouse position relative to canvas
        var pos = await JSRuntime.InvokeAsync<object>("getCanvasMousePosition", new object[] { CanvasRef, new { clientX = e.ClientX, clientY = e.ClientY } });
        var x = Convert.ToDouble(((dynamic)pos).x);
        var y = Convert.ToDouble(((dynamic)pos).y);

        // If we're in token placement mode, remember position for when we add the token
        if (_tokenTypeToAdd != AssetType.Placeholder)
        {
            _pendingTokenPosition = new Position { Left = x, Top = y };
            _showAssetSelectorModal = true;
            return;
        }

        // Otherwise, try to select a token
        var tokenData = await JSRuntime.InvokeAsync<object>("findTokenAt", new object[] { x, y, Scene.SceneAssets.Select(a => new
        {
            assetId = a.AssetId,
            number = a.Number,
            position = a.Position,
            scale = a.Scale,
            isLocked = a.IsLocked
        }).ToArray() });

        if (tokenData != null)
        {
            var assetId = Guid.Parse(((dynamic)tokenData).assetId.ToString());
            var number = Convert.ToUInt32(((dynamic)tokenData).number);

            // Find the token in our scene assets
            _selectedToken = Scene.SceneAssets.FirstOrDefault(a => a.AssetId == assetId && a.Number == number);

            if (_selectedToken != null && !_selectedToken.IsLocked)
            {
                _isDragging = true;
            }
        }
        else
        {
            // Clicked empty space, deselect
            _selectedToken = null;
        }

        await DrawSceneAsync();
    }

    private async Task OnCanvasMouseMove(MouseEventArgs e)
    {
        if (_isDragging && _selectedToken != null && Scene != null)
        {
            // Get mouse position
            var pos = await JSRuntime.InvokeAsync<object>("getCanvasMousePosition", new object[] { CanvasRef, new { clientX = e.ClientX, clientY = e.ClientY } });
            var x = Convert.ToDouble(((dynamic)pos).x);
            var y = Convert.ToDouble(((dynamic)pos).y);

            // Update token position
            if (_snapToGrid && GridSettings.Type != GridType.None)
            {
                // Snap to nearest grid point
                double gridX = GridSettings.Offset.Left;
                double gridY = GridSettings.Offset.Top;
                double cellWidth = GridSettings.CellSize.Width > 0 ? GridSettings.CellSize.Width : 50;
                double cellHeight = GridSettings.CellSize.Height > 0 ? GridSettings.CellSize.Height : 50;

                // Calculate nearest grid point
                x = Math.Round((x - gridX) / cellWidth) * cellWidth + gridX;
                y = Math.Round((y - gridY) / cellHeight) * cellHeight + gridY;
            }

            _selectedToken.Position = new Position { Left = x, Top = y };
            await DrawSceneAsync();
        }
    }

    private void OnCanvasMouseUp(MouseEventArgs e)
    {
        _isDragging = false;
    }

    private async Task OnCanvasContextMenu(MouseEventArgs e)
    {
        if (_selectedToken == null || Scene == null) return;

        // Show context menu at mouse position
        _contextMenuPosition = new Position { Left = e.ClientX, Top = e.ClientY };
        _showTokenContextMenu = true;

        await DrawSceneAsync();
    }

    private void CloseContextMenu()
    {
        _showTokenContextMenu = false;
    }

    private async Task ToggleLockSelectedToken()
    {
        if (_selectedToken != null && Scene != null)
        {
            _selectedToken.IsLocked = !_selectedToken.IsLocked;
            _showTokenContextMenu = false;
            
            // Update the token on the server
            var updateRequest = new UpdateSceneAssetRequest
            {
                AssetId = _selectedToken.AssetId,
                Number = _selectedToken.Number,
                Name = _selectedToken.Name,
                Position = _selectedToken.Position,
                Scale = _selectedToken.Scale,
                IsLocked = _selectedToken.IsLocked
            };
            
            await LibraryClient.UpdateSceneAssetAsync(
                Scene.Id, _selectedToken.AssetId, _selectedToken.Number, updateRequest);
            
            await DrawSceneAsync();
        }
    }

    private async Task DeleteSelectedToken()
    {
        if (_selectedToken != null && Scene != null)
        {
            await LibraryClient.RemoveSceneAssetAsync(
                Scene.Id, _selectedToken.AssetId, _selectedToken.Number);
                
            Scene.SceneAssets.Remove(_selectedToken);
            _selectedToken = null;
            _showTokenContextMenu = false;
            await DrawSceneAsync();
        }
    }

    private void OnImageFileSelected(InputFileChangeEventArgs e)
    {
        _selectedImageFile = e.File;
    }

    private void OnAssetFileSelected(InputFileChangeEventArgs e)
    {
        _selectedAssetFile = e.File;
    }

    private async Task SaveBackgroundImage()
    {
        if (_selectedImageFile != null && Scene != null)
        {
            try
            {
                // Create a new asset for the background image
                var createAssetRequest = new CreateAssetRequest
                {
                    Name = $"Background for {Scene.Name}",
                    Type = AssetType.Object
                };
                
                var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);
                
                if (assetResult.IsSuccess && assetResult.Value != null)
                {
                    // Upload the image file
                    using var stream = _selectedImageFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
                    await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _selectedImageFile.Name);
                    
                    // Update the scene with the new background path
                    var assetPath = GetAssetPath(AssetType.Object, assetResult.Value.Id);
                    Scene.Stage.Source = assetPath;
                    
                    var updateRequest = new UpdateSceneRequest
                    {
                        Name = Scene.Name,
                        Description = Scene.Description,
                        Stage = Scene.Stage,
                        IsListed = Scene.IsListed,
                        IsPublic = Scene.IsPublic
                    };
                    
                    await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);
                    
                    _showChangeImageModal = false;
                    await DrawSceneAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving background image: {ex.Message}");
            }
        }
    }

    private async Task SaveGridSettings()
    {
        if (Scene != null)
        {
            Scene.Stage.Grid = GridSettings;
            
            var updateRequest = new UpdateSceneRequest
            {
                Name = Scene.Name,
                Description = Scene.Description,
                Stage = Scene.Stage,
                IsListed = Scene.IsListed,
                IsPublic = Scene.IsPublic
            };
            
            await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);
            
            _showGridSettingsModal = false;
            await DrawSceneAsync();
        }
    }

    private async Task AddTokenToScene()
    {
        if (Scene != null)
        {
            try
            {
                // First, create a new asset
                var createAssetRequest = new CreateAssetRequest
                {
                    Name = _newAssetName,
                    Type = _tokenTypeToAdd
                };
                
                var assetResult = await AssetsClient.CreateAssetAsync(createAssetRequest);
                
                if (assetResult.IsSuccess && assetResult.Value != null)
                {
                    // If we have a file, upload it
                    if (_selectedAssetFile != null)
                    {
                        using var stream = _selectedAssetFile.OpenReadStream(maxAllowedSize: 10 * 1024 * 1024); // 10 MB
                        await AssetsClient.UploadAssetFileAsync(assetResult.Value.Id, stream, _selectedAssetFile.Name);
                    }
                    
                    // Add the asset to the scene
                    var addAssetRequest = new AddNewSceneAssetRequest
                    {
                        AssetId = assetResult.Value.Id,
                        Name = _newAssetName,
                        Position = _pendingTokenPosition,
                        Scale = 1.0
                    };
                    
                    var sceneAssetResult = await LibraryClient.AddSceneAssetAsync(Scene.Id, addAssetRequest);
                    
                    if (sceneAssetResult.IsSuccess && sceneAssetResult.Value != null)
                    {
                        // Add to our local scene data
                        Scene.SceneAssets.Add(sceneAssetResult.Value);
                    }
                    
                    _showAssetSelectorModal = false;
                    _tokenTypeToAdd = AssetType.Placeholder;
                    _newAssetName = string.Empty;
                    _selectedAssetFile = null;
                    
                    await DrawSceneAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding token: {ex.Message}");
            }
        }
    }

    private async Task SaveScene()
    {
        if (Scene == null) return;

        try
        {
            // Update the scene on the server
            var updateRequest = new UpdateSceneRequest
            {
                Name = Scene.Name,
                Description = Scene.Description,
                Stage = Scene.Stage,
                IsListed = Scene.IsListed,
                IsPublic = Scene.IsPublic
            };

            await LibraryClient.UpdateSceneAsync(Scene.Id, updateRequest);

            NavigateBack();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving scene: {ex.Message}");
        }
    }

    private void NavigateBack()
    {
        NavigationManager.NavigateTo($"/library/adventures/{Scene?.AdventureId}");
    }
}