namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal sealed class SceneInputModel {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public bool IsPublic { get; set; }
}