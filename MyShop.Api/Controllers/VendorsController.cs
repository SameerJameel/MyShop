using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _db;

    public VendorsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _db.Vendors.AsNoTracking().ToListAsync();
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVendor(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(Vendor vendor)
    {
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetVendor), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVendor(int id, Vendor vendor)
    {
        if (id != vendor.Id) return BadRequest();

        _db.Entry(vendor).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();

        _db.Vendors.Remove(vendor);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
