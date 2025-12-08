using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ItemsController(AppDbContext db)
    {
        _db = db;
    }

    // GET: api/items
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems()
    {
        var items = await _db.Items
            .Include(i => i.Category)
            .AsNoTracking()
            .ToListAsync();

        return Ok(items);
    }

    // GET: api/items/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _db.Items
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null) return NotFound();

        return Ok(item);
    }

    // POST: api/items
    [HttpPost]
    public async Task<ActionResult<Item>> CreateItem(Item item)
    {
        _db.Items.Add(item);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    // PUT: api/items/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateItem(int id, Item item)
    {
        if (id != item.Id) return BadRequest();

        _db.Entry(item).State = EntityState.Modified;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _db.Items.AnyAsync(i => i.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // DELETE: api/items/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();

        _db.Items.Remove(item);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
