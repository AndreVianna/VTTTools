using VttTools.Common.Model;

namespace VttTools.WebApp.Pages.Assets;

internal sealed class AssetsInputModel {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    [Required(AllowEmptyStrings = false)]
    public string Source { get; set; } = string.Empty;
    public AssetType Type { get; set; } = AssetType.Placeholder;
    public Visibility Visibility { get; set; } = Visibility.Hidden;
    public InputError[] Errors { get; set; } = [];
}