using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.Migrations;

/// <inheritdoc />
public partial class SeedLibrarySchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.InsertData(
            table: "Adventures",
            columns: ["Id", "CampaignId", "Description", "ImageId", "IsPublic", "IsPublished", "Name", "OwnerId", "Type"],
            values: new object[,]
            {
                { new Guid("0196f86e-6669-78ee-95eb-4303c232295c"), null, "Test 1", null, false, false, "Test 1", new Guid("019639ea-c7de-7a01-8548-41edfccde206"), "Generic" },
                { new Guid("0196f86e-9220-769d-bf71-173f30d7177a"), null, "Test 2", null, false, false, "Test 2", new Guid("019639ea-c7de-7a01-8548-41edfccde206"), "Generic" },
                { new Guid("0196f86e-ce48-7b61-8dfa-3c1d535cc6c4"), null, "Test 3", null, false, false, "Test 3", new Guid("019639ea-c7de-7a01-8548-41edfccde206"), "Generic" },
                { new Guid("0196f86e-f929-7768-9b42-33e61727b389"), null, "Test 4", null, true, true, "Test 4", new Guid("00000000-0000-0000-0000-000000000000"), "Generic" },
                { new Guid("0196f86f-1c09-76a5-9f50-89ec627e5d00"), null, "Test 5", null, true, true, "Test 5", new Guid("00000000-0000-0000-0000-000000000000"), "Generic" },
                { new Guid("0196f86f-4212-78eb-8354-a990b4937911"), null, "Test 6", null, true, true, "Test 6", new Guid("00000000-0000-0000-0000-000000000000"), "Generic" }
            });

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86e-6669-78ee-95eb-4303c232295c"));

        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86e-9220-769d-bf71-173f30d7177a"));

        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86e-ce48-7b61-8dfa-3c1d535cc6c4"));

        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86e-f929-7768-9b42-33e61727b389"));

        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86f-1c09-76a5-9f50-89ec627e5d00"));

        migrationBuilder.DeleteData(
            table: "Adventures",
            keyColumn: "Id",
            keyValue: new Guid("0196f86f-4212-78eb-8354-a990b4937911"));
    }
}
