using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Emek.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class profilFotoRelatives : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageBase64",
                table: "StudentPersonalInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageContentType",
                table: "StudentPersonalInfos",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Relatives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    NationalId = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Occupation = table.Column<string>(type: "text", nullable: false),
                    RelationType = table.Column<string>(type: "text", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relatives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relatives_StudentPersonalInfos_StudentId",
                        column: x => x.StudentId,
                        principalTable: "StudentPersonalInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Relatives_StudentId",
                table: "Relatives",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Relatives");

            migrationBuilder.DropColumn(
                name: "ProfileImageBase64",
                table: "StudentPersonalInfos");

            migrationBuilder.DropColumn(
                name: "ProfileImageContentType",
                table: "StudentPersonalInfos");
        }
    }
}
