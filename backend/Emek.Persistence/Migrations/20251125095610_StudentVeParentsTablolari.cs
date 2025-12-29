using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Emek.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class StudentVeParentsTablolari : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StudentFatherInfos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    NationalId = table.Column<int>(type: "integer", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Occupation = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentFatherInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StudentMotherInfos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    NationalId = table.Column<int>(type: "integer", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Occupation = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentMotherInfos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StudentPersonalInfos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NationalId = table.Column<int>(type: "integer", nullable: false),
                    SchoolName = table.Column<string>(type: "text", nullable: false),
                    HomeAddress = table.Column<string>(type: "text", nullable: false),
                    Branch = table.Column<string>(type: "text", nullable: false),
                    MotherId = table.Column<Guid>(type: "uuid", nullable: false),
                    FatherId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentPersonalInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentPersonalInfos_StudentFatherInfos_FatherId",
                        column: x => x.FatherId,
                        principalTable: "StudentFatherInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentPersonalInfos_StudentMotherInfos_MotherId",
                        column: x => x.MotherId,
                        principalTable: "StudentMotherInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StudentFatherInfos_NationalId",
                table: "StudentFatherInfos",
                column: "NationalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentMotherInfos_NationalId",
                table: "StudentMotherInfos",
                column: "NationalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentPersonalInfos_FatherId",
                table: "StudentPersonalInfos",
                column: "FatherId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentPersonalInfos_MotherId",
                table: "StudentPersonalInfos",
                column: "MotherId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentPersonalInfos_NationalId",
                table: "StudentPersonalInfos",
                column: "NationalId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentPersonalInfos");

            migrationBuilder.DropTable(
                name: "StudentFatherInfos");

            migrationBuilder.DropTable(
                name: "StudentMotherInfos");
        }
    }
}
