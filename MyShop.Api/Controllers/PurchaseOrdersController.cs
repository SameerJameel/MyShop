using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.DTOs;
using MyShop.Api.Models;
using MyShop.Api.Services;

namespace MyShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly StockService _stock;
    public PurchaseOrdersController(AppDbContext db, StockService stock)
    {
        _db = db;
        _stock = stock;
    }

    // GET: api/purchaseorders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetAll()
    {
        var list = await _db.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Lines)
                .ThenInclude(l => l.Item)
            .OrderByDescending(p => p.OrderDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(list);
    }

    // GET: api/purchaseorders/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PurchaseOrder>> GetById(int id)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Lines)
                .ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(p => p.Id == id);



        if (po == null) return NotFound();
        return Ok(po);
    }

    // POST: api/purchaseorders
    [HttpPost]
    public async Task<ActionResult<PurchaseOrder>> Create(PurchaseOrder po)
    {
        // تنظيف بسيط: ممنوع Ids على السطور الجديدة
        foreach (var line in po.Lines)
        {
            line.Id = 0;
        }

        _db.PurchaseOrders.Add(po);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = po.Id }, po);
    }

    // PUT: api/purchaseorders/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, PurchaseOrder po)
    {
        if (id != po.Id) return BadRequest();

        var existing = await _db.PurchaseOrders
            .Include(p => p.Lines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existing == null) return NotFound();

        // تحديث الحقول الأساسية
        existing.VendorId = po.VendorId;
        existing.OrderDate = po.OrderDate;
        existing.Status = po.Status;
        existing.Notes = po.Notes;

        // تحديث السطور (ببساطة: نحذف القديم ونضيف الجديد)
        _db.PurchaseOrderLines.RemoveRange(existing.Lines);
        existing.Lines.Clear();

        foreach (var line in po.Lines)
        {
            line.Id = 0;
            line.PurchaseOrderId = existing.Id;
            existing.Lines.Add(line);
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/purchaseorders/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var po = await _db.PurchaseOrders.FindAsync(id);
        if (po == null) return NotFound();

        _db.PurchaseOrders.Remove(po);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    //[HttpPost("{id:int}/receive")]
    //public async Task<IActionResult> Receive(int id)
    //{
    //    var po = await _db.PurchaseOrders.FindAsync(id);
    //    if (po == null)
    //        return NotFound();

    //    if (po.Status == PurchaseOrderStatus.Received)
    //        return BadRequest("Order already received.");

    //    po.Status = PurchaseOrderStatus.Received;
    //    po.ReceiveDate = System.DateTime.Now;

    //    await _db.SaveChangesAsync();

    //    return NoContent();
    //}
    /// <summary>
    /// جلب بيانات طلبية جاهزة لشاشة الاستلام
    /// GET: api/purchaseorders/{id}/receive
    /// </summary>
    [HttpGet("{id}/receive")]
    public async Task<ActionResult<PurchaseOrderReceiveVm>> GetForReceive(int id)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Vendor)
            .Include(p => p.Lines)
                .ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (po == null)
            return NotFound();

        var vm = new PurchaseOrderReceiveVm
        {
            Id = po.Id,
            OrderNumber = po.Id.ToString(), // عدّل لو عندك رقم طلبية حقيقي
            OrderDate = po.OrderDate,
            VendorName = po.Vendor?.Name ?? string.Empty,
            Status = po.Status.ToString(),
            DiscountAmount = po.DiscountAmount,
            PaidAmount = po.PaidAmount,
            Notes = po.Notes
        };

        foreach (var line in po.Lines)
        {
            vm.Lines.Add(new PurchaseOrderReceiveLineVm
            {
                LineId = line.Id,
                ItemId = line.ItemId,
                ItemName = line.Item.Name,
                Unit = line.Item.Unit,
                OrderedQuantity = line.OrderedQuantity,
                // لو ما كان في ReceivedQuantity سابقًا عبيها بالـ Ordered
                ReceivedQuantity = line.ReceivedQuantity > 0 ? line.ReceivedQuantity : line.OrderedQuantity,
                PurchasePrice = line.PurchasePrice > 0 ? line.PurchasePrice : line.Item.DefaultPurchasePrice,
                SalePrice = line.SalePrice > 0 ? line.SalePrice : line.Item.DefaultSalePrice
            });
        }

        return Ok(vm);
    }

    /// <summary>
    /// استلام الطلبية وتثبيت الكميات والأسعار وحالة الطلبية
    /// POST: api/purchaseorders/{id}/receive
    /// </summary>
    [HttpPost("{id:int}/receive")]
    public async Task<IActionResult> Receive(int id, [FromBody] PurchaseOrderReceiveRequest request, CancellationToken ct)
    {
        var po = await _db.PurchaseOrders
            .Include(p => p.Lines)
                .ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (po == null) return NotFound();

        // Transaction واحدة لكل العملية (رأس + أسطر + حركات)
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        // تحديث بيانات الرأس
        po.ReceiveDate = DateTime.UtcNow;
        po.DiscountAmount = request.DiscountAmount;
        po.PaidAmount = request.PaidAmount;
        po.Notes = request.Notes;
        po.Status = PurchaseOrderStatus.Received;

        // تحديث الأسطر + تسجيل حركات المخزون على الفرق فقط
        foreach (var reqLine in request.Lines)
        {
            var line = po.Lines.FirstOrDefault(l => l.Id == reqLine.LineId);
            if (line == null) continue;

            var oldReceived = line.ReceivedQuantity; // مهم
            var newReceived = reqLine.ReceivedQuantity;

            line.ReceivedQuantity = newReceived;
            line.PurchasePrice = reqLine.PurchasePrice;
            line.SalePrice = reqLine.SalePrice;

            // تحديث أسعار الصنف الافتراضية (اختياري)
            line.Item.DefaultPurchasePrice = reqLine.PurchasePrice;
            line.Item.DefaultSalePrice = reqLine.SalePrice;

            // دلتا الكمية = فقط اللي لازم يدخل مخزون
            var delta = newReceived - oldReceived;

            if (delta == 0) continue;

            if (delta > 0)
            {
                // استلام إضافي
                await _stock.PostMovementAsync(new StockMovement
                {
                    ItemId = line.ItemId,
                    Date = (DateTime.UtcNow),
                    Type = StockMovementType.PurchaseReceipt,
                    Qty = delta,
                    UnitCost = line.PurchasePrice,
                    PurchaseOrderId = po.Id,
                    PurchaseOrderLineId = line.Id,
                    Notes = $"PO Receive #{po.Id}"
                }, ct);
            }
            else
            {
                // تعديل نزول في المستلم (إرجاع/تصحيح)
                // خيار 1: اعتبره ReturnToVendor
                await _stock.PostMovementAsync(new StockMovement
                {
                    ItemId = line.ItemId,
                    Date = (DateTime.UtcNow),
                    Type = StockMovementType.ReturnToVendor,
                    Qty = delta, // delta سالب
                    UnitCost = null, // غير مطلوب
                    PurchaseOrderId = po.Id,
                    PurchaseOrderLineId = line.Id,
                    Notes = $"PO Receive correction/return #{po.Id}"
                }, ct);
            }
        }

        // إعادة احتساب إجمالي الطلبية بعد الاستلام والخصم
        po.TotalAmount = po.Lines.Sum(l => l.ReceivedQuantity * l.PurchasePrice) - po.DiscountAmount;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return NoContent();
    }

}



