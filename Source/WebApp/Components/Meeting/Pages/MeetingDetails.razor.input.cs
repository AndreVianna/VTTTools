namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class InputModel
        : IValidatable {
        public string Subject { get; set; } = string.Empty;
        public Result Validate(IMap? context = null) {
            var result = Result.Success();
            if (string.IsNullOrWhiteSpace(Subject))
                result += Result.Failure("Meeting subject is required.", nameof(Subject));
            return result;
        }
    }
}