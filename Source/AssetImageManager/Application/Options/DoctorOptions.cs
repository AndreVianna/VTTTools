namespace VttTools.AssetImageManager.Application.Options;

public sealed record DoctorOptions(
    bool Verbose = false,
    bool SkipApi = false
);
