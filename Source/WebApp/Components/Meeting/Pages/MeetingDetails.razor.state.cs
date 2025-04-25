using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class PageState {
        public Guid Id { get; set; } = Guid.Empty;
        public MeetingModel Meeting { get; set; } = null!;
        public bool CanStart { get; set; }
        public bool CanEdit { get; set; }
        public bool ShowEditDialog { get; set; }
        public InputModel Input { get; set; } = new();
        public IEnumerable<Error> Errors { get; set; } = [];
    }
}