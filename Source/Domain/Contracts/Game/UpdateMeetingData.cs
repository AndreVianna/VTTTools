﻿namespace VttTools.Contracts.Game;

public record UpdateMeetingData
    : Data {
    public string? Name { get; init; } = string.Empty;
    public Guid? EpisodeId { get; init; }
}
