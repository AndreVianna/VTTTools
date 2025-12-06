namespace VttTools.Configuration;

public sealed class PublicLibraryOptions {
    public const string SectionName = "PublicLibrary";

    public required Guid MasterUserId { get; init; }
}