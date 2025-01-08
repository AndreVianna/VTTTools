namespace HttpServices.Data;

public class Version7GuidBase64StringValueGenerator : ValueGenerator<string> {
    public override string Next(EntityEntry entry) => Base64UrlEncoder.Encode(Guid.CreateVersion7().ToByteArray());
    public override bool GeneratesTemporaryValues
        => false;
}