namespace VttTools.WebApp.Components.Game.Pages;

public partial class Assets {
    internal sealed class InputModel {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;

        [Required(AllowEmptyStrings = false)]
        public string Source { get; set; } = string.Empty;

        public AssetType Type { get; set; } = AssetType.Placeholder;

        public Visibility Visibility { get; set; } = Visibility.Hidden;
    }
}