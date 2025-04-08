namespace WebApi.EntityFrameworkCore.Utilities;

public class Version7GuidValueGenerator : ValueGenerator<Guid> {
    public override Guid Next(EntityEntry entry) => Guid.CreateVersion7();
    public override bool GeneratesTemporaryValues
        => false;
}