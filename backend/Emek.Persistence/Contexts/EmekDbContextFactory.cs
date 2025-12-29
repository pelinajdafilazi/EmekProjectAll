using Emek.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Emek.Persistence.Contexts
{
    public class EmekDbContextFactory : IDesignTimeDbContextFactory<EmekDbContext>
    {
        public EmekDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<EmekDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new EmekDbContext(optionsBuilder.Options);
        }
    }
}
