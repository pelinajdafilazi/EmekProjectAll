using Emek.Application.Interfaces.Attendances;
using Emek.Application.Interfaces.Debts;
using Emek.Application.Interfaces.Groups;
using Emek.Application.Interfaces.Lessons;
using Emek.Application.Interfaces.Parents;
using Emek.Application.Interfaces.Students;
using Emek.Infrastructure.Extensions;
using Emek.Infrastructure.Services.Attendances;
using Emek.Infrastructure.Services.Debts;
using Emek.Infrastructure.Services.Groups;
using Emek.Infrastructure.Services.Lessons;
using Emek.Infrastructure.Services.Parents;
using Emek.Infrastructure.Services.Students;
using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// CORS yapılandırması - Frontend'in backend'e erişebilmesi için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();   

builder.Services.AddPersistence(builder.Configuration);

// Application Services
builder.Services.AddScoped<IStudentPersonalInfoServices, StudentPersonalInfoServices>();
builder.Services.AddScoped<IRelativeServices, RelativeServices>();
builder.Services.AddScoped<IGroupServices, GroupServices>();
builder.Services.AddScoped<ILessonServices, LessonServices>();
builder.Services.AddScoped<IDebtServices, DebtServices>();
builder.Services.AddScoped<IAttendanceServices, AttendanceServices>();

var app = builder.Build();

// Migration'ları otomatik uygula (sadece Development'ta)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<EmekDbContext>();
            context.Database.Migrate();
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Migration hatası oluştu.");
        }
    }

    app.UseSwagger();
    app.UseSwaggerUI(); // Swagger UI 
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
