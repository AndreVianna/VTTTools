namespace VttTools.WebApp.Pages.Library.Scenes.Models;

internal sealed class ScenesInputModel {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsListed { get; set; }
    public bool IsPublic { get; set; }
}