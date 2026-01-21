namespace VttTools.AI.Providers.Google;

internal sealed class GoogleResponse {
    public GoogleCandidate[] Candidates { get; set; } = [];
    public GoogleUsageMetadata UsageMetadata { get; set; } = new();
}

internal sealed class GoogleCandidate {
    public GoogleContent Content { get; set; } = new();
}

internal sealed class GoogleContent {
    public GooglePart[] Parts { get; set; } = [];
}

internal sealed class GooglePart {
    public GoogleInlineData InlineData { get; set; } = new();
}

internal sealed class GoogleInlineData {
    public string MimeType { get; set; } = string.Empty;

    [JsonPropertyName("data")]
    public string Content { get; set; } = string.Empty;
}

internal sealed class GoogleUsageMetadata {
    public int PromptTokenCount { get; set; }
    public int CandidatesTokenCount { get; set; }
    public int TotalTokenCount { get; set; }
}