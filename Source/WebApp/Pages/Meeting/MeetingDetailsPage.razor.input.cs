namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingDetailsPage {
    internal class InputModel {
        public string Subject { get; set; } = string.Empty;
        public InputError[] Errors { get; set; } = [];
    }
}