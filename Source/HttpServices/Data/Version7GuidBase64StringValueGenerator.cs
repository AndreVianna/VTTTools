using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace HttpServices.Data;

public class Version7GuidBase64StringValueGenerator : ValueGenerator<string> {
    public override string Next(EntityEntry entry) => Convert.ToBase64String(Guid.CreateVersion7().ToByteArray());
    public override bool GeneratesTemporaryValues
        => false;
}