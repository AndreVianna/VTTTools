﻿namespace VttTools.Model.Game;

public class Epic {
    public Guid Id { get; set; }
    /// <summary>
    /// The owner of this epic.
    /// </summary>
    public Guid OwnerId { get; set; }
    public Guid? TemplateId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    /// <summary>
    /// The visibility setting for this epic.
    /// </summary>
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public HashSet<Campaign> Campaigns { get; set; } = [];
}
