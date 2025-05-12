namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed class AdventureInputModel {
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }

    [Required(AllowEmptyStrings = false)]
    [StringLength(128, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = false)]
    [StringLength(1024, MinimumLength = 10)]
    public string Description { get; set; } = string.Empty;

    public AdventureType Type { get; set; } = AdventureType.OpenWorld;

    public string? ImagePath { get; set; }

    public bool IsVisible { get; set; }

    public bool IsPublic { get; set; }

    public Guid? CampaignId { get; set; }

    public SceneListItem[] Scenes { get; set; } = [];
    public InputError[] Errors { get; set; } = [];
}