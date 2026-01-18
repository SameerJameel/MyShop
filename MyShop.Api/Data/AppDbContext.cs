using Microsoft.EntityFrameworkCore;
using MyShop.Api.Models;

namespace MyShop.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<ItemVendor> ItemVendors => Set<ItemVendor>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<Employee> Employees { get; set; } = null!;
    public DbSet<EmployeeTransaction> EmployeeTransactions { get; set; } = null!;
    public DbSet<Expense> Expenses { get; set; } = null!;
    public DbSet<Debt> Debts { get; set; } = null!;
    public DbSet<Inventory> Inventories { get; set; }
    public DbSet<InventoryLine> InventoryLines { get; set; }
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ItemVendor: composite key
        modelBuilder.Entity<ItemVendor>()
            .HasKey(iv => new { iv.ItemId, iv.VendorId });

        modelBuilder.Entity<ItemVendor>()
            .HasOne(iv => iv.Item)
            .WithMany(i => i.ItemVendors)
            .HasForeignKey(iv => iv.ItemId);

        modelBuilder.Entity<ItemVendor>()
            .HasOne(iv => iv.Vendor)
            .WithMany(v => v.ItemVendors)
            .HasForeignKey(iv => iv.VendorId);

        //// Category self reference
        //modelBuilder.Entity<Category>()
        //    .HasOne(c => c.Parent)
        //    .WithMany(c => c.Children)
        //    .HasForeignKey(c => c.ParentId)
        //    .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PurchaseOrder>()
            .HasMany(p => p.Lines)
            .WithOne(l => l.PurchaseOrder)
            .HasForeignKey(l => l.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PurchaseOrderLine>()
            .HasOne(l => l.Item)
            .WithMany()
            .HasForeignKey(l => l.ItemId);
        // Employee
        modelBuilder.Entity<Employee>()
            .Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<Employee>()
            .Property(e => e.BaseSalary)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Employee>()
            .Property(e => e.OvertimeHourlyRate)
            .HasColumnType("decimal(18,2)");

        // EmployeeTransaction
        modelBuilder.Entity<EmployeeTransaction>()
            .Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<EmployeeTransaction>()
            .Property(t => t.Hours)
            .HasColumnType("decimal(18,2)");

        // Expenses
        modelBuilder.Entity<Expense>()
            .Property(x => x.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Expense>()
            .Property(x => x.Category)
            .HasMaxLength(150);

        // Debts
        modelBuilder.Entity<Debt>()
            .Property(x => x.PersonName)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<Debt>()
            .Property(x => x.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<StockMovement>()
    .Property(x => x.Qty)
    .HasColumnType("decimal(18,3)");

        modelBuilder.Entity<StockMovement>()
            .Property(x => x.UnitCost)
            .HasColumnType("decimal(18,4)");

        modelBuilder.Entity<StockMovement>()
            .Property(x => x.AvgCostAfter)
            .HasColumnType("decimal(18,4)");

        modelBuilder.Entity<Item>()
            .Property(x => x.OnHandQty)
            .HasColumnType("decimal(18,3)");

        modelBuilder.Entity<Item>()
            .Property(x => x.AvgCost)
            .HasColumnType("decimal(18,4)");


        base.OnModelCreating(modelBuilder);
    }
}
