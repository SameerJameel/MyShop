using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseOrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public PurchaseOrdersController(AppDbContext db)
    {
        _db = db;
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

    [HttpPost("{id:int}/receive")]
    public async Task<IActionResult> Receive(int id)
    {
        var po = await _db.PurchaseOrders.FindAsync(id);
        if (po == null)
            return NotFound();

        if (po.Status == PurchaseOrderStatus.Received)
            return BadRequest("Order already received.");

        po.Status = PurchaseOrderStatus.Received;
        await _db.SaveChangesAsync();

        return NoContent();
    }

}
