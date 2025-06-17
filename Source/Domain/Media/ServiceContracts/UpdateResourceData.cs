namespace VttTools.Media.ServiceContracts;

public record UpdateResourceData
    : Data {
    public Optional<ListPatcher<string>> Tags { get; set; }
}