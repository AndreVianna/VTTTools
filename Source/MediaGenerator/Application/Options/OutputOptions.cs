namespace VttTools.MediaGenerator.Application.Options;

public sealed record OutputOptions(
    bool VerboseOutput = false,
    bool ShowAllVariants = false);