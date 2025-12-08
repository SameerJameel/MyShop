using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpensesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> Get(DateTime? from, DateTime? to)
        {
            var q = _context.Expenses.AsQueryable();

            if (from.HasValue) q = q.Where(e => e.Date >= from.Value);
            if (to.HasValue) q = q.Where(e => e.Date <= to.Value);

            var list = await q
                .AsNoTracking()
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<Expense>> Create(Expense expense)
        {
            expense.Id = 0;
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return Ok(expense);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, Expense expense)
        {
            if (id != expense.Id) return BadRequest("Id mismatch.");

            var existing = await _context.Expenses.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Date = expense.Date;
            existing.Category = expense.Category;
            existing.Amount = expense.Amount;
            existing.PaymentMethod = expense.PaymentMethod;
            existing.Notes = expense.Notes;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Expenses.FindAsync(id);
            if (existing == null) return NotFound();

            _context.Expenses.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
