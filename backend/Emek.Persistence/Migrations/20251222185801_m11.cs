using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Emek.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class m11 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DebtAmount",
                table: "Debts");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Debts");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfPayment",
                table: "Debts",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DateOfPayment",
                table: "Debts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DebtAmount",
                table: "Debts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Debts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
