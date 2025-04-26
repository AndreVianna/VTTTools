namespace VttTools.WebApp.Pages.Game;

public partial class EpisodesPage {
    internal sealed class InputModel {
        public Guid Id { get; set; }
        [Required(AllowEmptyStrings = false)]
        public string Name { get; set; } = string.Empty;
        public Visibility Visibility { get; set; } = Visibility.Hidden;
        public InputError[] Errors { get; set; } = [];
    }
}