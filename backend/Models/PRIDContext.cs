using System;
using Microsoft.EntityFrameworkCore;

namespace prid_2324_a11.Models;

public class PridContext : DbContext{
    public PridContext(DbContextOptions<PridContext> options)
        : base(options) {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Pseudo = "admin", Email = "admin@epfc.eu", FirstName = "Admin", LastName = "Admin", Password = "admin", Role = Role.Admin },
            new User { Id = 2, Pseudo = "ben", Email = "bepenelle@epfc.eu", FirstName = "Benoit", LastName = "Penelle", Password = "ben", BirthDate = new DateTime(1975, 6, 23) },
            new User { Id = 3, Pseudo = "bruno", Email = "brlacroix@epfc.eu", FirstName = "Bruno", LastName = "Lacroix", Password = "bruno", BirthDate = new DateTime(1970, 7, 13) },
            new User { Id = 4, Pseudo = "alain", Email = "alsilovy@epfc.eu", FirstName = "Alain", LastName = "Silovy", Password = "alain", BirthDate = new DateTime(1965, 8, 22) },
            new User { Id = 5, Pseudo = "xavier", Email = "xapigeolet@epfc.eu", FirstName = "Xavier", LastName = "Pigeolet", Password = "xavier", BirthDate = new DateTime(1985, 9, 21) },
            new User { Id = 6, Pseudo = "boris", Email = "boverhaegen@epfc.eu", FirstName = "Boris", LastName = "Verhaegen", Password = "boris", BirthDate = new DateTime(1980, 10, 20) },
            new User { Id = 7, Pseudo = "marc", Email = "mamichel@epfc.eu", FirstName = "Marc", LastName = "Michel", Password = "marc", BirthDate = new DateTime(1983, 11, 19) }
        );

        /* ----------  User      -------- */
        modelBuilder.Entity<User>().HasIndex(u => u.Id).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.Pseudo).IsRequired();
        modelBuilder.Entity<User>().Property(u => u.Password).IsRequired();
        modelBuilder.Entity<User>().Property(u => u.Email).IsRequired();
        modelBuilder.Entity<User>().HasMany(u => u.Attempts)
                    .WithOne(a => a.Student)
                    .OnDelete(DeleteBehavior.Cascade);

        // modelBuilder.Entity<User>()
        //     .HasDiscriminator(u => u.Role)
        //     .HasValue<User>(Role.Student)
        //     .HasValue<User>(Role.Teacher)
        //     .HasValue<User>(Role.Admin);


        /* ----------  Attempt   -------- */








    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Solution> Solutions => Set<Solution>();
    public DbSet<Database> QuizTags => Set<Database>();

}
