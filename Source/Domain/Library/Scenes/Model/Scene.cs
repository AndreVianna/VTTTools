﻿namespace VttTools.Library.Scenes.Model;

public class Scene {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    /// <summary>
    /// The owner of this scene.
    /// </summary>
    public Guid OwnerId { get; set; }
    public Guid ParentId { get; set; }
    public Adventure Adventure { get; set; } = null!;
    public bool IsTemplate { get; set; }
    public Guid? TemplateId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this scene.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public Stage Stage { get; set; } = new();
    public List<SceneAsset> SceneAssets { get; set; } = [];
}