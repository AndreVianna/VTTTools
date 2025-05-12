namespace VttTools.WebApp.Pages.Library.Adventures.Models;

public sealed class AdventureListItem {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    public Visibility Visibility { get; set; } = Visibility.Hidden;
}
