namespace VttTools.MediaGenerator.Application.Options;

public sealed record PrepareOptions(
    string InputPath,
    bool ShowAll = false,
    int? Limit = null);