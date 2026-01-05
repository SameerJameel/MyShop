using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyShop.Api.Migrations
{
    /// <inheritdoc />
    public partial class inv_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "PurchaseOrderLines",
                newName: "SalePrice");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "PurchaseOrders",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "PurchaseOrders",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                table: "PurchaseOrders",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceiveDate",
                table: "PurchaseOrders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "PurchaseOrders",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OrderedQuantity",
                table: "PurchaseOrderLines",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "PurchaseOrderLines",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ReceivedQuantity",
                table: "PurchaseOrderLines",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "PaidAmount",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "ReceiveDate",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "OrderedQuantity",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "PurchaseOrderLines");

            migrationBuilder.DropColumn(
                name: "ReceivedQuantity",
                table: "PurchaseOrderLines");

            migrationBuilder.RenameColumn(
                name: "SalePrice",
                table: "PurchaseOrderLines",
                newName: "Quantity");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "PurchaseOrders",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");
        }
    }
}
