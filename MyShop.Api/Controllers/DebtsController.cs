using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DebtsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DebtsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Debt>>> Get(bool? isVendor)
        {
            var q = _context.Debts.AsQueryable(); // لو الاسم Debts عدّله

            if (isVendor.HasValue)
                q = q.Where(d => d.IsVendor == isVendor.Value);

            var list = await q
                .AsNoTracking()
                .OrderByDescending(d => d.Date)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<Debt>> Create(Debt debt)
        {
            debt.Id = 0;
            _context.Debts.Add(debt);
            await _context.SaveChangesAsync();
            return Ok(debt);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, Debt debt)
        {
            if (id != debt.Id) return BadRequest("Id mismatch.");

            var existing = await _context.Debts.FindAsync(id);
            if (existing == null) return NotFound();

            existing.PersonName = debt.PersonName;
            existing.IsVendor = debt.IsVendor;
            existing.Phone = debt.Phone;
            existing.Date = debt.Date;
            existing.Amount = debt.Amount;
            existing.Direction = debt.Direction;
            existing.Notes = debt.Notes;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Debts.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Debts.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
