using System;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

// Running migrations:
// dotnet ef migrations add MigrationName
// dotnet ef database update
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Setup> Setups { get; set; }
    public DbSet<Battle> Battles { get; set; }
    public DbSet<Vote> Votes { get; set; }

    // runs once when app starts up
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Setup>()
            .HasQueryFilter(s => s.IsActive);

        modelBuilder.Entity<Battle>()
            .HasOne(b => b.Setup1)
            .WithMany()
            .HasForeignKey(b => b.Setup1Id)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Battle>()
            .HasQueryFilter(b => b.Setup1.IsActive && b.Setup2.IsActive)
            .HasOne(b => b.Setup2)
            .WithMany()
            .HasForeignKey(b => b.Setup2Id)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Vote>()
            .HasQueryFilter(v => v.Winner.IsActive && v.Loser.IsActive)
            .HasOne(v => v.Winner)
            .WithMany()
            .HasForeignKey(v => v.WinnerId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Loser)
            .WithMany()
            .HasForeignKey(v => v.LoserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
