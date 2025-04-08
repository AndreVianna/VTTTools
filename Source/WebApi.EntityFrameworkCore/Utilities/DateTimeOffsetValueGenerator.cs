namespace WebApi.EntityFrameworkCore.Utilities;

public class DateTimeOffsetValueGenerator
    : ValueGenerator<DateTimeOffset> {
    public override DateTimeOffset Next(EntityEntry entry) => DateTimeOffset.UtcNow;
    public override bool GeneratesTemporaryValues
        => false;
}