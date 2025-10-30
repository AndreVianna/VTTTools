#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class AddStructuresDomainModels : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "SceneStructures");

        migrationBuilder.DropTable(
            name: "Structures");

        migrationBuilder.CreateTable(
            name: "Barriers",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                IsOpaque = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                IsSolid = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                IsSecret = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsOpenable = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Barriers", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Regions",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                RegionType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                LabelMap = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Regions", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Sources",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true),
                SourceType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                DefaultRange = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 5.0m),
                DefaultIntensity = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: false, defaultValue: 1.0m),
                DefaultIsGradient = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Sources", x => x.Id));

        migrationBuilder.CreateTable(
            name: "SceneBarriers",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                BarrierId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsOpen = table.Column<bool>(type: "bit", nullable: true),
                IsLocked = table.Column<bool>(type: "bit", nullable: true),
                Vertices = table.Column<string>(type: "nvarchar(max)", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneBarriers", x => x.Id);
                table.ForeignKey(
                    name: "FK_SceneBarriers_Barriers_BarrierId",
                    column: x => x.BarrierId,
                    principalTable: "Barriers",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_SceneBarriers_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SceneRegions",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                RegionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Value = table.Column<int>(type: "int", nullable: false),
                Vertices = table.Column<string>(type: "nvarchar(max)", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneRegions", x => x.Id);
                table.ForeignKey(
                    name: "FK_SceneRegions_Regions_RegionId",
                    column: x => x.RegionId,
                    principalTable: "Regions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_SceneRegions_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "SceneSources",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SceneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Range = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 5.0m),
                Intensity = table.Column<decimal>(type: "decimal(3,2)", precision: 3, scale: 2, nullable: false, defaultValue: 1.0m),
                IsGradient = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                Position_X = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0),
                Position_Y = table.Column<double>(type: "float", nullable: false, defaultValue: 0.0)
            },
            constraints: table => {
                table.PrimaryKey("PK_SceneSources", x => x.Id);
                table.ForeignKey(
                    name: "FK_SceneSources_Scenes_SceneId",
                    column: x => x.SceneId,
                    principalTable: "Scenes",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SceneSources_Sources_SourceId",
                    column: x => x.SourceId,
                    principalTable: "Sources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_SceneBarriers_BarrierId",
            table: "SceneBarriers",
            column: "BarrierId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneBarriers_SceneId",
            table: "SceneBarriers",
            column: "SceneId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneRegions_RegionId",
            table: "SceneRegions",
            column: "RegionId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneRegions_SceneId",
            table: "SceneRegions",
            column: "SceneId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneSources_SceneId",
            table: "SceneSources",
            column: "SceneId");

        migrationBuilder.CreateIndex(
            name: "IX_SceneSources_SourceId",
            table: "SceneSources",
            column: "SourceId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) {
        migrationBuilder.DropTable(
            name: "SceneBarriers");

        migrationBuilder.DropTable(
            name: "SceneRegions");

        migrationBuilder.DropTable(
            name: "SceneSources");

        migrationBuilder.DropTable(
            name: "Barriers");

        migrationBuilder.DropTable(
            name: "Regions");

        migrationBuilder.DropTable(
            name: "Sources");
    }
}