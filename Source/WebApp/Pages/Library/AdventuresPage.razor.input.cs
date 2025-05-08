namespace VttTools.WebApp.Pages.Library;

internal sealed class AdventuresInputModel {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public InputError[] Errors { get; set; } = [];
}