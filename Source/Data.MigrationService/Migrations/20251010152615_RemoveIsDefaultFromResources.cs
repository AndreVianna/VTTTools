using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations; 
/// <inheritdoc />
public partial class RemoveIsDefaultFromResources : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) =>
        // Remove IsDefault property from each object in the Resources JSON array
        // Uses JSON_QUERY to preserve the JSON array structure
        migrationBuilder.Sql(@"
                UPDATE Assets
                SET Resources = (
                    SELECT JSON_QUERY('[' + STRING_AGG(
                        JSON_MODIFY(
                            JSON_MODIFY(value, '$.IsDefault', NULL),
                            'strict $.IsDefault'
                        ), ',') + ']')
                    FROM OPENJSON(Resources)
                )
                WHERE Resources IS NOT NULL
                  AND JSON_QUERY(Resources) IS NOT NULL;
            ");

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) =>
        // Cannot restore IsDefault property - data loss migration
        // Would need to infer which resource should be default based on business logic
        migrationBuilder.Sql(@"
                -- No rollback possible - IsDefault property cannot be restored
                -- This would require business logic to determine which resource should be default
            ");
}