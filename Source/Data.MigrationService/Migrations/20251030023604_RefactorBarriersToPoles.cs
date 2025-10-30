using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VttTools.Data.MigrationService.Migrations
{
    /// <inheritdoc />
    public partial class RefactorBarriersToPoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Poles",
                table: "Barriers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Visibility",
                table: "Barriers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsClosed",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Poles",
                table: "SceneBarriers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE Barriers
                SET
                    Poles = (
                        SELECT '[' + STRING_AGG(
                            '{""x"":' + CAST(JSON_VALUE(value, '$.x') AS varchar(50)) +
                            ',""y"":' + CAST(JSON_VALUE(value, '$.y') AS varchar(50)) +
                            ',""h"":' + CAST(COALESCE(Height, 2.0) AS varchar(50)) + '}',
                            ',') + ']'
                        FROM OPENJSON(Vertices)
                    ),
                    Visibility = CASE WHEN IsOpaque = 1 THEN 0 ELSE 1 END,
                    IsClosed = 0
                WHERE Poles IS NULL AND Vertices IS NOT NULL;

                UPDATE SceneBarriers
                SET
                    Poles = (
                        SELECT '[' + STRING_AGG(
                            '{""x"":' + CAST(JSON_VALUE(value, '$.x') AS varchar(50)) +
                            ',""y"":' + CAST(JSON_VALUE(value, '$.y') AS varchar(50)) +
                            ',""h"":2.0}',
                            ',') + ']'
                        FROM OPENJSON(Vertices)
                    )
                WHERE Poles IS NULL AND Vertices IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "Vertices",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsOpaque",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsSolid",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsSecret",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsOpenable",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "Vertices",
                table: "SceneBarriers");

            migrationBuilder.DropColumn(
                name: "IsOpen",
                table: "SceneBarriers");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "SceneBarriers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Vertices",
                table: "Barriers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Height",
                table: "Barriers",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOpaque",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSolid",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSecret",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsOpenable",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Barriers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Vertices",
                table: "SceneBarriers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOpen",
                table: "SceneBarriers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "SceneBarriers",
                type: "bit",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE Barriers
                SET
                    Vertices = (
                        SELECT '[' + STRING_AGG(
                            '{""x"":' + CAST(JSON_VALUE(value, '$.x') AS varchar(50)) +
                            ',""y"":' + CAST(JSON_VALUE(value, '$.y') AS varchar(50)) + '}',
                            ',') + ']'
                        FROM OPENJSON(Poles)
                    ),
                    Height = (SELECT MAX(CAST(JSON_VALUE(value, '$.h') AS float)) FROM OPENJSON(Poles)),
                    IsOpaque = CASE WHEN Visibility = 0 THEN 1 ELSE 0 END,
                    IsSolid = 1,
                    IsSecret = IsClosed,
                    IsOpenable = 0,
                    IsLocked = 0
                WHERE Vertices IS NULL AND Poles IS NOT NULL;

                UPDATE SceneBarriers
                SET
                    Vertices = (
                        SELECT '[' + STRING_AGG(
                            '{""x"":' + CAST(JSON_VALUE(value, '$.x') AS varchar(50)) +
                            ',""y"":' + CAST(JSON_VALUE(value, '$.y') AS varchar(50)) + '}',
                            ',') + ']'
                        FROM OPENJSON(Poles)
                    ),
                    IsOpen = 0,
                    IsLocked = 0
                WHERE Vertices IS NULL AND Poles IS NOT NULL;
            ");

            migrationBuilder.DropColumn(
                name: "Poles",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "Visibility",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "IsClosed",
                table: "Barriers");

            migrationBuilder.DropColumn(
                name: "Poles",
                table: "SceneBarriers");
        }
    }
}
