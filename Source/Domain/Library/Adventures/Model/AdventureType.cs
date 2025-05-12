namespace VttTools.Library.Adventures.Model;

/// <summary>
/// Defines the type of adventure.
/// </summary>
public enum AdventureType {
    /// <summary>
    /// Open world adventure with free exploration.
    /// </summary>
    [Display(Name = "Open World")]
    OpenWorld,

    /// <summary>
    /// Adventure focused on exploring dungeon environments.
    /// </summary>
    [Display(Name = "Dungeon Crawl")]
    DungeonCrawl,

    /// <summary>
    /// Combat-focused adventure.
    /// </summary>
    [Display(Name = "Hack-n-Slash")]
    HackAndSlash,

    /// <summary>
    /// Adventure focused on survival elements.
    /// </summary>
    [Display(Name = "Survival")]
    Survival,

    /// <summary>
    /// Adventure with specific goals and objectives.
    /// </summary>
    [Display(Name = "Goal Driven")]
    GoalDriven,

    /// <summary>
    /// Adventure with procedurally generated content.
    /// </summary>
    [Display(Name = "Randomly Generated")]
    RandomlyGenerated,
}