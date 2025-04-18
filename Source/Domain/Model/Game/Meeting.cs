﻿namespace VttTools.Model.Game;

public class Meeting {
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid OwnerId { get; set; }
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
    public HashSet<MeetingPlayer> Players { get; set; } = [];
    public Guid? EpisodeId { get; set; }
    public HashSet<MeetingMessage> Messages { get; set; } = [];
    public HashSet<MeetingEvent> Events { get; set; } = [];
}
