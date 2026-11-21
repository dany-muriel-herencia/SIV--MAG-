using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TiendaApi.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "CashRegisters",
                newName: "OpeningNotes");

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "CreditPayments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "CreditPayments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CashRegisterId",
                table: "CreditPayments",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelled",
                table: "CreditPayments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PaymentType",
                table: "CreditPayments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ClosingNotes",
                table: "CashRegisters",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditPayments_CashRegisterId",
                table: "CreditPayments",
                column: "CashRegisterId");

            migrationBuilder.AddForeignKey(
                name: "FK_CreditPayments_CashRegisters_CashRegisterId",
                table: "CreditPayments",
                column: "CashRegisterId",
                principalTable: "CashRegisters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CreditPayments_CashRegisters_CashRegisterId",
                table: "CreditPayments");

            migrationBuilder.DropIndex(
                name: "IX_CreditPayments_CashRegisterId",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "CashRegisterId",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "IsCancelled",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "CreditPayments");

            migrationBuilder.DropColumn(
                name: "ClosingNotes",
                table: "CashRegisters");

            migrationBuilder.RenameColumn(
                name: "OpeningNotes",
                table: "CashRegisters",
                newName: "Notes");
        }
    }
}
