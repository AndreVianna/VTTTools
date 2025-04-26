namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class InputModel {
        public string Subject { get; set; } = string.Empty;
        public Error[] Errors { get; set; } = [];
    }
}