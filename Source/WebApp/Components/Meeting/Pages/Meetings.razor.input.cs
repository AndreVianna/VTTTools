namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    internal class InputModel {
        public string Subject { get; set; } = string.Empty;

        internal ICollection<Adventure> Adventures { get; set; } = [];
        internal Guid AdventureId { get; set; } = Guid.Empty;

        internal ICollection<Episode> Episodes { get; set; } = [];
        internal Guid EpisodeId { get; set; } = Guid.Empty;

        public Error[] Errors { get; set; } = [];
    }
}