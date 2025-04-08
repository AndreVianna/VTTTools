namespace WebApi.EntityFrameworkCore.Utilities;

public class DateTimeValueGenerator : ValueGenerator<DateTime> {
    public override DateTime Next(EntityEntry entry) => DateTime.UtcNow;
    public override bool GeneratesTemporaryValues
        => false;
}
