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
    public DbSet<SavedSetup> SavedSetups { get; set; }
    public DbSet<Image> Images { get; set; }

    // runs once when app starts up
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Setup>().HasQueryFilter(s => s.IsActive);

        // Cascade delete ensures that
        // if User gets deleted, all their setup gets deleted
        // delete flow: User -> Setup -> SavedSetup
        modelBuilder
            .Entity<Setup>()
            .HasOne(s => s.User)
            .WithMany(s => s.Setups)
            .HasForeignKey(s => s.CreatedBy)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Battle>().HasQueryFilter(b => b.Setup1.IsActive && b.Setup2.IsActive);

        modelBuilder
            .Entity<Battle>()
            .HasOne(b => b.Setup1)
            .WithMany()
            .HasForeignKey(b => b.Setup1Id)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder
            .Entity<Battle>()
            .HasOne(b => b.Setup2)
            .WithMany()
            .HasForeignKey(b => b.Setup2Id)
            .OnDelete(DeleteBehavior.NoAction);

        // (UserId, SetupId) pair has to be unique
        modelBuilder.Entity<SavedSetup>().HasIndex(s => new { s.UserId, s.SetupId }).IsUnique();

        modelBuilder.Entity<SavedSetup>().HasQueryFilter(s => s.Setup.IsActive);

        // one-to-many relationships
        // setup -> savedSetup
        modelBuilder
            .Entity<SavedSetup>()
            .HasOne(s => s.Setup)
            .WithMany(s => s.SavedSetups)
            .HasForeignKey(s => s.SetupId)
            .IsRequired() // foreign key column cannot be NULL
            .OnDelete(DeleteBehavior.Cascade);

        // one-to-many relationships
        // user -> savedSetup
        modelBuilder
            .Entity<SavedSetup>()
            .HasOne(s => s.User)
            .WithMany(u => u.SavedSetups)
            .HasForeignKey(s => s.UserId)
            .IsRequired() // foreign key column cannot be NULL
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<Image>().HasQueryFilter(i => i.Setup.IsActive);

        // one-to-many relationships
        // setup -> image (up to 4 per setup, the limit is checked in the endpoint)
        // if a Setup gets deleted, its Image rows get deleted too
        modelBuilder
            .Entity<Image>()
            .HasOne(i => i.Setup)
            .WithMany(s => s.Images)
            .HasForeignKey(i => i.SetupId)
            .IsRequired() // foreign key column cannot be NULL
            .OnDelete(DeleteBehavior.Cascade);
    }
}
