namespace VttTools.WebApp.Server.Pages.Assets.List;

internal sealed class AssetsInputModel {
    public Guid Id { get; set; }
    [Required(AllowEmptyStrings = false)]
    public string Name { get; set; } = string.Empty;
    [Required(AllowEmptyStrings = false)]
    public string Description { get; set; } = string.Empty;
    public AssetType Type { get; set; }
    public InputError[] Errors { get; set; } = [];
}