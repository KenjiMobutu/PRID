using Microsoft.EntityFrameworkCore;

namespace prid_tuto.Models;

public class MsnContext : DbContext
{
    public MsnContext(DbContextOptions<MsnContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        //modelBuilder.Entity<User>().HasIndex(u => u.Pseudo).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Id).IsUnique();

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Pseudo = "ben", Email = "bepenelle@epfc.eu", FirstName = "Benoit", LastName = "Penelle", Password = "ben", BirthDate = new DateTime(1975, 6, 23) },
            new User { Id = 2, Pseudo = "bruno", Email = "brlacroix@epfc.eu", FirstName = "Bruno", LastName = "Lacroix", Password = "bruno", BirthDate = new DateTime(1970, 7, 13) },
            new User { Id = 3, Pseudo = "alain", Email = "alsilovy@epfc.eu", FirstName = "Alain", LastName = "Silovy", Password = "alain", BirthDate = new DateTime(1965, 8, 22) },
            new User { Id = 4, Pseudo = "xavier", Email = "xapigeolet@epfc.eu", FirstName = "Xavier", LastName = "Pigeolet", Password = "xavier", BirthDate = new DateTime(1985, 9, 21) },
            new User { Id = 5, Pseudo = "boris", Email = "boverhaegen@epfc.eu", FirstName = "Boris", LastName = "Verhaegen", Password = "boris", BirthDate = new DateTime(1980, 10, 20) },
            new User { Id = 6, Pseudo = "marc", Email = "mamichel@epfc.eu", FirstName = "Marc", LastName = "Michel", Password = "marc", BirthDate = new DateTime(1983, 11, 19) }
        );
    }

    public DbSet<User> Users => Set<User>();
}
