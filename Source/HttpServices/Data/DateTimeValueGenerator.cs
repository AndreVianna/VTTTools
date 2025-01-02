using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace HttpServices.Data;

public class DateTimeValueGenerator : ValueGenerator<DateTime> {
    public override DateTime Next(EntityEntry entry) => DateTime.UtcNow;
    public override bool GeneratesTemporaryValues
        => false;
}
