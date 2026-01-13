using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Connection string من appsettings
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS: اسم policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});
builder.Services.AddScoped<StockService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// فعّل CORS قبل MapControllers
app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();
