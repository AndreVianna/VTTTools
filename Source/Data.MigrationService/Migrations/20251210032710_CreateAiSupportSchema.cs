#nullable disable

namespace VttTools.Data.MigrationService.Migrations;

/// <inheritdoc />
public partial class CreateAiSupportSchema : Migration {
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder) {
        migrationBuilder.CreateTable(
            name: "PromptTemplates",
            columns: table => new {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                Category = table.Column<string>(type: "nvarchar(450)", nullable: false),
                Version = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false, defaultValue: "1.0-draft"),
                SystemPrompt = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                UserPromptTemplate = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                NegativePromptTemplate = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                ReferenceImageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
            },
            constraints: table => {
                table.PrimaryKey("PK_PromptTemplates", x => x.Id);
                table.ForeignKey(
                    name: "FK_PromptTemplates_Resources_ReferenceImageId",
                    column: x => x.ReferenceImageId,
                    principalTable: "Resources",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PromptTemplates_Category",
            table: "PromptTemplates",
            column: "Category");

        migrationBuilder.CreateIndex(
            name: "IX_PromptTemplates_Name",
            table: "PromptTemplates",
            column: "Name");

        migrationBuilder.CreateIndex(
            name: "IX_PromptTemplates_Name_Version",
            table: "PromptTemplates",
            columns: ["Name", "Version"],
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_PromptTemplates_ReferenceImageId",
            table: "PromptTemplates",
            column: "ReferenceImageId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(
            name: "PromptTemplates");
}
