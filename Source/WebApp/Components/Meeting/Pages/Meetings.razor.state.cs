using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    internal class PageState {
        internal List<MeetingModel> Meetings { get; set; } = [];

        internal bool ShowCreateDialog { get; set; }
        internal InputModel Input { get; set; } = new();
    }
}