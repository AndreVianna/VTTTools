using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingsPage {
    internal class PageState {
        internal List<MeetingModel> Meetings { get; set; } = [];

        internal bool ShowCreateDialog { get; set; }
        internal InputModel Input { get; set; } = new();
    }
}