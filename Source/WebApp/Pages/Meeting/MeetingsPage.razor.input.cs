namespace VttTools.WebApp.Pages.Meeting;

internal class MeetingsPageInputModel {
    public string Subject { get; set; } = string.Empty;

    internal ICollection<Adventure> Adventures { get; set; } = [];
    internal Guid AdventureId { get; set; } = Guid.Empty;

    internal ICollection<Episode> Episodes { get; set; } = [];
    internal Guid EpisodeId { get; set; } = Guid.Empty;

    public InputError[] Errors { get; set; } = [];
}