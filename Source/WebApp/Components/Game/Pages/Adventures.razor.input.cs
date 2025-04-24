namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    internal sealed class InputModel {
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;

        public Visibility Visibility { get; set; } = Visibility.Hidden;
    }
}