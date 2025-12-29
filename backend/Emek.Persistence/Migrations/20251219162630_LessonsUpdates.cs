using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Emek.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LessonsUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndingDay",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "StartingDay",
                table: "Lessons");

            migrationBuilder.AddColumn<int>(
                name: "EndingDayOfWeek",
                table: "Lessons",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndingHour",
                table: "Lessons",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "StartingDayOfWeek",
                table: "Lessons",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartingHour",
                table: "Lessons",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndingDayOfWeek",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "EndingHour",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "StartingDayOfWeek",
                table: "Lessons");

            migrationBuilder.DropColumn(
                name: "StartingHour",
                table: "Lessons");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndingDay",
                table: "Lessons",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartingDay",
                table: "Lessons",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
