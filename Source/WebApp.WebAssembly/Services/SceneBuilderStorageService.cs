namespace VttTools.WebApp.Services;

/// <summary>
/// Handles local storage operations for scene builder state
/// </summary>
public sealed class SceneBuilderStorageService(IJSRuntime jsRuntime)
{
    /// <summary>
    /// Gets a value from local storage or returns default if not found
    /// </summary>
    /// <typeparam name="T">Type of value to retrieve</typeparam>
    /// <param name="key">Storage key</param>
    /// <param name="sceneId">Scene ID for scoped storage</param>
    /// <param name="defaultValue">Default value if not found</param>
    /// <returns>Stored value or default</returns>
    public async Task<T> GetFromLocalStorageOrDefaultAsync<T>(string key, Guid? sceneId, T defaultValue)
    {
        try
        {
            var itemKey = sceneId.HasValue ? $"sceneBuilder:{key}:{sceneId}" : $"sceneBuilder:{key}";
            var json = await jsRuntime.InvokeAsync<string?>("localStorage.getItem", itemKey);

            if (string.IsNullOrEmpty(json))
                return defaultValue;

            var result = JsonSerializer.Deserialize<T>(json);
            return result ?? defaultValue;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading from local storage: {ex.Message}");
            return defaultValue;
        }
    }

    /// <summary>
    /// Saves a value to local storage
    /// </summary>
    /// <typeparam name="T">Type of value to save</typeparam>
    /// <param name="key">Storage key</param>
    /// <param name="sceneId">Scene ID for scoped storage</param>
    /// <param name="value">Value to save</param>
    public async Task SaveToLocalStorageAsync<T>(string key, Guid? sceneId, T value)
    {
        try
        {
            var itemKey = sceneId.HasValue ? $"sceneBuilder:{key}:{sceneId}" : $"sceneBuilder:{key}";
            var json = JsonSerializer.Serialize(value);
            await jsRuntime.InvokeVoidAsync("localStorage.setItem", itemKey, json);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving to local storage: {ex.Message}");
        }
    }

    /// <summary>
    /// Saves the current scene builder state to local storage
    /// </summary>
    /// <param name="state">Builder state to save</param>
    public async Task SaveStateAsync(BuilderState state)
    {
        if (state.SceneId == Guid.Empty)
            return;

        await Task.WhenAll(
            SaveToLocalStorageAsync("panOffset", state.SceneId, state.PanOffset),
            SaveToLocalStorageAsync("zoomLevel", state.SceneId, state.ZoomLevel),
            SaveToLocalStorageAsync("grid", state.SceneId, state.Grid)
        );
    }

    /// <summary>
    /// Loads scene builder state from local storage
    /// </summary>
    /// <param name="sceneId">Scene ID to load state for</param>
    /// <param name="defaultZoomLevel">Default zoom level if not stored</param>
    /// <returns>Loaded builder state</returns>
    public async Task<(Point PanOffset, float ZoomLevel, GridDetails Grid)> LoadStateAsync(Guid sceneId, float defaultZoomLevel = 1.0f)
    {
        var panOffsetTask = Task.Run(() => GetFromLocalStorageOrDefaultAsync("panOffset", sceneId, new Point(0, 0)));
        var zoomLevelTask = Task.Run(() => GetFromLocalStorageOrDefaultAsync("zoomLevel", sceneId, defaultZoomLevel));
        var gridTask = Task.Run(() => GetFromLocalStorageOrDefaultAsync("grid", sceneId, new GridDetails
        {
            Type = GridType.NoGrid,
            CellSize = new(50, 50),
            Offset = new(0, 0),
            Snap = false,
        }));
        await Task.WhenAll(panOffsetTask, zoomLevelTask, gridTask);
        return (panOffsetTask.Result, zoomLevelTask.Result, gridTask.Result);
    }
}