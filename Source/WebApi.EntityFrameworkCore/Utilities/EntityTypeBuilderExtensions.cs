namespace WebApi.EntityFrameworkCore.Utilities;

public static class EntityTypeBuilderExtensions {
    public static void ConvertPersonalDataProperties<TEntity>(this EntityTypeBuilder<TEntity> entityTypeBuilder, ValueConverter? converter)
        where TEntity : class {
        if (converter is null)
            return;
        var personalDataProps = typeof(TEntity).GetProperties()
                                               .Where(prop => Attribute.IsDefined(prop, typeof(ProtectedPersonalDataAttribute)));
        foreach (var p in personalDataProps) {
            if (p.PropertyType != typeof(string))
                throw new InvalidOperationException($"Entity '{typeof(TEntity).Name}': Can only protect strings.");
            entityTypeBuilder.Property<string>(p.Name).HasConversion(converter);
        }
    }
}
