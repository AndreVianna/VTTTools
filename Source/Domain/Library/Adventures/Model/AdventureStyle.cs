namespace VttTools.Library.Adventures.Model;

/// <summary>
/// Defines the type of adventure.
/// </summary>
public enum AdventureStyle {
    [Display(Name = "Generic")]
    Generic,
    [Display(Name = "Open World")]
    OpenWorld,
    [Display(Name = "Dungeon Crawl")]
    DungeonCrawl,
    [Display(Name = "Hack-n-Slash")]
    HackNSlash,
    [Display(Name = "Survival")]
    Survival,
    [Display(Name = "Goal Driven")]
    GoalDriven,
    [Display(Name = "Randomly Generated")]
    RandomlyGenerated,
}