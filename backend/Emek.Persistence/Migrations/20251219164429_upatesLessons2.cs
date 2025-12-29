using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Emek.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class upatesLessons2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Class",
                table: "StudentPersonalInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "StudentPersonalInfos",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StartingDayOfWeek",
                table: "Lessons",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "EndingDayOfWeek",
                table: "Lessons",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Class",
                table: "StudentPersonalInfos");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "StudentPersonalInfos");

            migrationBuilder.AlterColumn<int>(
                name: "StartingDayOfWeek",
                table: "Lessons",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "EndingDayOfWeek",
                table: "Lessons",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
