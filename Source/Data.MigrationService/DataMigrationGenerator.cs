namespace VttTools.Data.MigrationService;

/// <summary>
/// Generates data-only EF Core migration files from existing database content.
/// </summary>
public static class DataMigrationGenerator {
    public static async Task GenerateAsync(
        ApplicationDbContext context,
        string migrationName,
        string outputPath,
        string[]? includeTables = null,
        string[]? excludeTables = null,
        CancellationToken ct = default) {
        Console.WriteLine($"Generating data migration: {migrationName}");

        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var className = $"{timestamp}_{migrationName}";
        var fileName = $"{className}.cs";
        var filePath = Path.Combine(outputPath, fileName);

        var tables = GetOrderedTables(context, includeTables, excludeTables);
        Console.WriteLine($"Found {tables.Count} tables to export");

        var upBuilder = new StringBuilder();
        var downBuilder = new StringBuilder();
        var totalRows = 0;

        foreach (var table in tables) {
            (var upCode, var downCode, var rowCount) = await GenerateTableDataAsync(context, table, ct);
            if (rowCount > 0) {
                upBuilder.Append(upCode);
                downBuilder.Insert(0, downCode); // Reverse order for Down
                totalRows += rowCount;
                Console.WriteLine($"  - {table.GetTableName()}: {rowCount} rows");
            }
        }

        var migrationCode = GenerateMigrationClass(className, upBuilder.ToString(), downBuilder.ToString());
        await File.WriteAllTextAsync(filePath, migrationCode, ct);

        // Generate designer file
        var designerCode = GenerateDesignerClass(className);
        var designerPath = Path.Combine(outputPath, $"{className}.Designer.cs");
        await File.WriteAllTextAsync(designerPath, designerCode, ct);

        Console.WriteLine($"Generated migration with {totalRows} total rows");
        Console.WriteLine($"Output: {filePath}");
    }

    private static List<IEntityType> GetOrderedTables(
        ApplicationDbContext context,
        string[]? includeTables,
        string[]? excludeTables) {
        var model = context.Model;
        var entityTypes = model.GetEntityTypes()
            .Where(e => !e.IsOwned() && e.GetTableName() is not null)
            .ToList();

        // Filter by include/exclude
        if (includeTables is { Length: > 0 }) {
            entityTypes = [.. entityTypes.Where(e => includeTables.Contains(e.GetTableName(), StringComparer.OrdinalIgnoreCase))];
        }

        if (excludeTables is { Length: > 0 }) {
            entityTypes = [.. entityTypes.Where(e => !excludeTables.Contains(e.GetTableName(), StringComparer.OrdinalIgnoreCase))];
        }

        // Topological sort based on foreign key dependencies
        return TopologicalSort(entityTypes);
    }

    private static List<IEntityType> TopologicalSort(List<IEntityType> entities) {
        var sorted = new List<IEntityType>();
        var visited = new HashSet<string>();
        var visiting = new HashSet<string>();

        void Visit(IEntityType entity) {
            var tableName = entity.GetTableName()!;
            if (visited.Contains(tableName))
                return;
            if (visiting.Contains(tableName))
                return; // Circular reference - skip

            visiting.Add(tableName);

            // Visit dependencies first
            foreach (var fk in entity.GetForeignKeys()) {
                var principal = fk.PrincipalEntityType;
                if (principal != entity && entities.Contains(principal)) {
                    Visit(principal);
                }
            }

            visiting.Remove(tableName);
            visited.Add(tableName);
            sorted.Add(entity);
        }

        foreach (var entity in entities) {
            Visit(entity);
        }

        return sorted;
    }

    private static IEnumerable<IProperty> GetAllPropertiesIncludingOwned(
        IEntityType entityType,
        StoreObjectIdentifier tableIdentifier) {
        // Get direct properties of the entity that are mapped to this table
        foreach (var property in entityType.GetProperties()) {
            var columnName = property.GetColumnName(tableIdentifier);
            if (columnName is not null) {
                yield return property;
            }
        }

        // Get properties from owned entities (table splitting) - but NOT JSON columns
        // JSON columns are handled separately by GetJsonColumnNames
        foreach (var navigation in entityType.GetNavigations()) {
            if (navigation.TargetEntityType.IsOwned()) {
                // Skip JSON-stored owned entities - they're handled as raw JSON columns
                var ownedEntityType = navigation.TargetEntityType;
                if (ownedEntityType.IsMappedToJson()) {
                    continue;
                }

                foreach (var ownedProperty in ownedEntityType.GetProperties()) {
                    // Check if property is mapped to a column in this specific table
                    var columnName = ownedProperty.GetColumnName(tableIdentifier);
                    if (columnName is not null && !ownedProperty.IsForeignKey()) {
                        yield return ownedProperty;
                    }
                }
            }
        }

        // Get properties from complex types (EF Core 8+ feature)
        foreach (var complexProperty in entityType.GetComplexProperties()) {
            foreach (var prop in GetComplexTypeProperties(complexProperty.ComplexType, tableIdentifier)) {
                yield return prop;
            }
        }
    }

    /// <summary>
    /// Gets JSON column names for owned entities stored with ToJson().
    /// </summary>
    private static IEnumerable<string> GetJsonColumnNames(IEntityType entityType) {
        foreach (var navigation in entityType.GetNavigations()) {
            if (navigation.TargetEntityType.IsOwned()) {
                var ownedEntityType = navigation.TargetEntityType;
                if (ownedEntityType.IsMappedToJson()) {
                    // The JSON column is typically named after the navigation property
                    yield return navigation.Name;
                }
            }
        }
    }

    private static IEnumerable<IProperty> GetComplexTypeProperties(
        IComplexType complexType,
        StoreObjectIdentifier tableIdentifier) {
        // Get direct properties of this complex type
        foreach (var property in complexType.GetProperties()) {
            var columnName = property.GetColumnName(tableIdentifier);
            if (columnName is not null) {
                yield return property;
            }
        }

        // Recursively get properties from nested complex types
        foreach (var nestedComplexProperty in complexType.GetComplexProperties()) {
            foreach (var prop in GetComplexTypeProperties(nestedComplexProperty.ComplexType, tableIdentifier)) {
                yield return prop;
            }
        }
    }

    private static async Task<(string UpCode, string DownCode, int RowCount)> GenerateTableDataAsync(
        ApplicationDbContext context,
        IEntityType entityType,
        CancellationToken ct) {
        var tableName = entityType.GetTableName()!;
        var schema = entityType.GetSchema();
        var tableIdentifier = StoreObjectIdentifier.Table(tableName, schema);

        // Get all properties including owned entity properties (excluding JSON columns)
        var properties = GetAllPropertiesIncludingOwned(entityType, tableIdentifier)
            .Where(p => !p.IsShadowProperty() || p.IsPrimaryKey())
            .ToList();

        // Get JSON column names (for OwnsMany/OwnsOne with ToJson())
        var jsonColumnNames = GetJsonColumnNames(entityType).ToList();

        // Build SQL query using table-specific column names
        var propertyColumns = properties.Select(p => $"[{p.GetColumnName(tableIdentifier)}]");
        var jsonColumns = jsonColumnNames.Select(name => $"[{name}]");
        var allColumns = propertyColumns.Concat(jsonColumns);
        var columns = string.Join(", ", allColumns);
        var sql = $"SELECT {columns} FROM [{tableName}]";

        var rows = new List<Dictionary<string, object?>>();

        await using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;

        await context.Database.OpenConnectionAsync(ct);
        try {
            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct)) {
                var row = new Dictionary<string, object?>();
                var columnIndex = 0;

                // Read property columns
                for (var i = 0; i < properties.Count; i++) {
                    var value = reader.IsDBNull(columnIndex) ? null : reader.GetValue(columnIndex);
                    row[properties[i].GetColumnName(tableIdentifier)!] = value;
                    columnIndex++;
                }

                // Read JSON columns as strings
                foreach (var jsonColumn in jsonColumnNames) {
                    var value = reader.IsDBNull(columnIndex) ? null : reader.GetString(columnIndex);
                    row[jsonColumn] = value;
                    columnIndex++;
                }

                rows.Add(row);
            }
        }
        finally {
            await context.Database.CloseConnectionAsync();
        }

        if (rows.Count == 0) {
            return (string.Empty, string.Empty, 0);
        }

        // Generate Up code
        var upBuilder = new StringBuilder();
        var propertyColumnNames = properties.Select(p => p.GetColumnName(tableIdentifier)!);
        var columnNames = propertyColumnNames.Concat(jsonColumnNames).ToArray();
        var primaryKeyColumns = entityType.FindPrimaryKey()?.Properties
            .Select(p => p.GetColumnName(tableIdentifier)!)
            .ToArray() ?? [];

        upBuilder.AppendLine("        migrationBuilder.InsertData(");
        upBuilder.AppendLine($"            table: \"{tableName}\",");
        upBuilder.AppendLine($"            columns: [{string.Join(", ", columnNames.Select(c => $"\"{c}\""))}],");

        if (rows.Count == 1) {
            upBuilder.AppendLine($"            values: new object[] {{ {GenerateRowValues(rows[0], properties, tableIdentifier, jsonColumnNames)} }});");
        }
        else {
            upBuilder.AppendLine("            values: new object[,]");
            upBuilder.AppendLine("            {");
            for (var i = 0; i < rows.Count; i++) {
                var comma = i < rows.Count - 1 ? "," : "";
                upBuilder.AppendLine($"                {{ {GenerateRowValues(rows[i], properties, tableIdentifier, jsonColumnNames)} }}{comma}");
            }
            upBuilder.AppendLine("            });");
        }
        upBuilder.AppendLine();

        // Generate Down code
        var downBuilder = new StringBuilder();
        if (primaryKeyColumns.Length == 1) {
            var pkColumn = primaryKeyColumns[0];
            var pkProperty = properties.First(p => p.GetColumnName(tableIdentifier) == pkColumn);
            var pkValues = rows.Select(r => FormatValue(r[pkColumn], pkProperty)).ToArray();

            downBuilder.AppendLine("        migrationBuilder.DeleteData(");
            downBuilder.AppendLine($"            table: \"{tableName}\",");
            downBuilder.AppendLine($"            keyColumn: \"{pkColumn}\",");
            if (pkValues.Length == 1) {
                downBuilder.AppendLine($"            keyValue: {pkValues[0]});");
            }
            else {
                downBuilder.AppendLine($"            keyValues: [{string.Join(", ", pkValues)}]);");
            }
        }
        else if (primaryKeyColumns.Length > 1) {
            // Composite key - delete each row individually
            foreach (var row in rows) {
                downBuilder.AppendLine("        migrationBuilder.DeleteData(");
                downBuilder.AppendLine($"            table: \"{tableName}\",");
                downBuilder.AppendLine($"            keyColumns: [{string.Join(", ", primaryKeyColumns.Select(c => $"\"{c}\""))}],");
                var keyValues = primaryKeyColumns.Select(c => {
                    var prop = properties.First(p => p.GetColumnName(tableIdentifier) == c);
                    return FormatValue(row[c], prop);
                });
                downBuilder.AppendLine($"            keyValues: [{string.Join(", ", keyValues)}]);");
                downBuilder.AppendLine();
            }
        }
        downBuilder.AppendLine();

        return (upBuilder.ToString(), downBuilder.ToString(), rows.Count);
    }

    private static string GenerateRowValues(
        IReadOnlyDictionary<string, object?> row,
        IEnumerable<IProperty> properties,
        StoreObjectIdentifier tableIdentifier,
        IEnumerable<string> jsonColumnNames) {
        var propertyValues = properties.Select(p => FormatValue(row[p.GetColumnName(tableIdentifier)!], p));
        var jsonValues = jsonColumnNames.Select(name => FormatJsonValue(row[name]));
        return string.Join(", ", propertyValues.Concat(jsonValues));
    }

    private static string FormatJsonValue(object? value) {
        if (value is null or DBNull) {
            return "null";
        }
        // JSON columns are stored as strings
        return $"@\"{EscapeString((string)value)}\"";
    }

    private static string FormatValue(object? value, IReadOnlyPropertyBase property) {
        if (value is null or DBNull) {
            return "null";
        }

        var clrType = property.ClrType;
        var underlyingType = Nullable.GetUnderlyingType(clrType) ?? clrType;

        // Handle enums - check if stored as string or int
        if (underlyingType.IsEnum) {
            return FormatEnumValue(value);
        }

        // Handle arrays (like string[])
        return underlyingType.IsArray
            ? FormatArrayValue(value, underlyingType)
            : underlyingType switch {
                var t when t == typeof(Guid) => $"new Guid(\"{value}\")",
                var t when t == typeof(string) => $"@\"{EscapeString((string)value)}\"",
                var t when t == typeof(bool) => ((bool)value).ToString().ToLowerInvariant(),
                var t when t == typeof(DateTime) => $"new DateTime({((DateTime)value).Ticks}L, DateTimeKind.{((DateTime)value).Kind})",
                var t when t == typeof(DateTimeOffset) => FormatDateTimeOffset((DateTimeOffset)value),
                var t when t == typeof(TimeSpan) => $"new TimeSpan({((TimeSpan)value).Ticks}L)",
                var t when t == typeof(decimal) => $"{value}m",
                var t when t == typeof(double) => $"{value}d",
                var t when t == typeof(float) => $"{value}f",
                var t when t == typeof(long) => $"{value}L",
                var t when t == typeof(byte[]) => FormatByteArray((byte[])value),
                _ => value.ToString() ?? "null"
            };
    }

    private static string FormatEnumValue(object value)
        => value is string stringValue
               ? $"@\"{EscapeString(stringValue)}\""
               : Convert.ToInt32(value).ToString();

    private static string FormatArrayValue(object value, Type arrayType) {
        var elementType = arrayType.GetElementType()!;

        // When the DB stores arrays as JSON strings (nvarchar), output the raw string
        // EF Core will handle the deserialization when reading
        if (value is string jsonValue) {
            return $"@\"{EscapeString(jsonValue)}\"";
        }

        // Handle actual arrays (when DB stores as actual array type, which is rare)
        if (value is Array arr) {
            if (arr.Length == 0) {
                return $"Array.Empty<{elementType.Name}>()";
            }

            var elements = new List<string>();
            foreach (var item in arr) {
                if (item is string s) {
                    elements.Add($"@\"{EscapeString(s)}\"");
                }
                else {
                    elements.Add(item?.ToString() ?? "null");
                }
            }
            return $"new {elementType.Name}[] {{ {string.Join(", ", elements)} }}";
        }

        return $"Array.Empty<{elementType.Name}>()";
    }

    private static string EscapeString(string value) => value.Replace("\"", "\"\"");

    private static string FormatDateTimeOffset(DateTimeOffset value) => $"new DateTimeOffset({value.Ticks}L, new TimeSpan({value.Offset.Ticks}L))";

    private static string FormatByteArray(byte[] bytes)
        => bytes.Length == 0 ? "Array.Empty<byte>()"
         : bytes.Length <= 16 ? $"new byte[] {{ {string.Join(", ", bytes.Select(b => $"0x{b:X2}"))} }}"
         : $"Convert.FromBase64String(\"{Convert.ToBase64String(bytes)}\")";

    private static string GenerateMigrationClass(string className, string upCode, string downCode) {
        // Remove timestamp prefix for valid C# class name (timestamps start with digits)
        var csharpClassName = className.Contains('_')
            ? className[(className.IndexOf('_') + 1)..]
            : className;

        return $@"// <auto-generated />
// Generated by DataMigrationGenerator
#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class {csharpClassName} : Migration {{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {{
{upCode}    }}

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {{
{downCode}    }}
}}
";
    }

    private static string GenerateDesignerClass(string className) {
        // Remove timestamp prefix for valid C# class name (timestamps start with digits)
        var csharpClassName = className.Contains('_')
            ? className[(className.IndexOf('_') + 1)..]
            : className;

        return $$"""
                 // <auto-generated />
                 using Microsoft.EntityFrameworkCore;
                 using Microsoft.EntityFrameworkCore.Infrastructure;
                 using Microsoft.EntityFrameworkCore.Migrations;

                 #nullable disable

                 namespace VttTools.Data.MigrationService.Migrations;

                 [DbContext(typeof(ApplicationDbContext))]
                 [Migration("{{className}}")]
                 partial class {{csharpClassName}} {
                     /// <inheritdoc />
                     protected override void BuildTargetModel(ModelBuilder modelBuilder) {
                 #pragma warning disable 612, 618
                         // This is a data-only migration, no model changes
                 #pragma warning restore 612, 618
                     }
                 }

                 """;
    }
}