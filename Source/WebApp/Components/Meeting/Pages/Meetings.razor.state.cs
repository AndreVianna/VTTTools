using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    internal class PageState {
        internal List<MeetingModel> Meetings { get; set; } = [];
        internal bool ShowCreateDialog { get; set; }
        internal string NewMeetingSubject { get; set; } = string.Empty;
        internal string MeetingSubjectError { get; set; } = string.Empty;

        internal List<Adventure> Adventures { get; set; } = [];
        internal Guid? SelectedAdventureId { get; set; }

        internal List<Episode> Episodes { get; set; } = [];
        internal Guid? SelectedEpisodeId { get; set; }
        internal bool ShowEpisodeError { get; set; }
    }
}