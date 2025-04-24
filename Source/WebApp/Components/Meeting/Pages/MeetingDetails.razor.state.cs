using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class PageState {
        public Guid Id { get; set; }

        public MeetingModel? Meeting { get; set; }

        public bool IsGameMaster { get; set; }

        public bool ShowEditDialog { get; set; }

        public string EditMeetingSubject { get; set; } = string.Empty;

        public string MeetingSubjectError { get; set; } = string.Empty;
    }
}