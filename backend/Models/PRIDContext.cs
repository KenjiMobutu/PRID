using System;
using Microsoft.EntityFrameworkCore;
using prid_2324_a11.Helpers;
namespace prid_2324_a11.Models;

public class PridContext : DbContext{
    public PridContext(DbContextOptions<PridContext> options): base(options) {

    }


    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        /* ----------  User      -------- */
        modelBuilder.Entity<Admin>().HasData(
            new Admin { Id = 1, Pseudo = "admin", Email = "admin@epfc.eu", FirstName = "Admin", LastName = "Admin", Password = TokenHelper.GetPasswordHash("admin"), Role = Role.Admin }
        );

        //split entity teacher, student, admin
        modelBuilder.Entity<Teacher>().HasData(
            new Teacher { Id = 2, Pseudo = "ben", Email = "bepenelle@epfc.eu", FirstName = "Benoit", LastName = "Penelle", Password = TokenHelper.GetPasswordHash("ben"), BirthDate = new DateTime(1975, 6, 23) },
            new Teacher { Id = 3, Pseudo = "bruno", Email = "brlacroix@epfc.eu", FirstName = "Bruno", LastName = "Lacroix", Password = TokenHelper.GetPasswordHash("bruno"), BirthDate = new DateTime(1970, 7, 13) },
            new Teacher { Id = 4, Pseudo = "alain", Email = "alsilovy@epfc.eu", FirstName = "Alain", LastName = "Silovy", Password = TokenHelper.GetPasswordHash("alain"), BirthDate = new DateTime(1965, 8, 22) },
            new Teacher { Id = 5, Pseudo = "xavier", Email = "xapigeolet@epfc.eu", FirstName = "Xavier", LastName = "Pigeolet", Password = TokenHelper.GetPasswordHash("xavier"), BirthDate = new DateTime(1985, 9, 21) },
            new Teacher { Id = 6, Pseudo = "boris", Email = "boverhaegen@epfc.eu", FirstName = "Boris", LastName = "Verhaegen", Password = TokenHelper.GetPasswordHash("boris"), BirthDate = new DateTime(1980, 10, 20) },
            new Teacher { Id = 7, Pseudo = "marc", Email = "mamichel@epfc.eu", FirstName = "Marc", LastName = "Michel", Password = TokenHelper.GetPasswordHash("marc"), BirthDate = new DateTime(1983, 11, 19) }
        );
        modelBuilder.Entity<Student>().HasData(
            new Student { Id = 8, Pseudo = "bob", Email = "bobeponge@epfc.eu", FirstName  = "Bob", LastName = "l'Eponge", Password = TokenHelper.GetPasswordHash("bob")},
            new Student { Id = 9, Pseudo = "caro", Email = "caromonaco@epfc.eu", FirstName  = "Caroline", LastName = "de Monaco", Password = TokenHelper.GetPasswordHash("caro")}
        );


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

        /* ----------  DATABASE   -------- */
        modelBuilder.Entity<Database>().HasData(
            new Database { Id = 1, Name = "fournisseurs", Description = "Base de données fournisseurs" },
            new Database { Id = 2, Name = "facebook", Description = "Base de données facebook" }
        );

        /* ----------  Quiz  -------- */
        modelBuilder.Entity<Quiz>().HasData(
            new Quiz { Id = 1, Name = "TP1", DatabaseId = 1, IsPublished = true },
            new Quiz { Id = 2, Name = "TP2", DatabaseId = 1, IsPublished = true },
            new Quiz { Id = 3, Name = "TP4", DatabaseId = 2, IsPublished = true },
            new Quiz {
                Id = 4,
                Name = "TEST2",
                DatabaseId = 1,
                IsPublished = true,
                IsTest = true,
                Start = DateTime.Now.AddDays(-1),
                Finish = DateTime.Now.AddDays(1)
            },
            new Quiz {
                Id = 5,
                Name = "TEST1",
                IsPublished = true,
                DatabaseId = 1,
                IsTest = true,
                Start = DateTime.Now.AddDays(-2),
                Finish = DateTime.Now.AddDays(-1)
            },
            new Quiz {
                Id = 6,
                Name = "TEST3",
                IsPublished = true,
                DatabaseId = 2,
                IsTest = true,
                Start = DateTime.Now,
                Finish = DateTime.Now.AddDays(2)
            }
        );

        /* ----------  QuestionsQuiz1   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 1, QuizId = 1, Order = 1, Body = "On veut afficher le contenu de la table des fournisseurs." },
            new Question { Id = 2, QuizId = 1, Order = 2, Body = "On veut le nom et la ville de tous les fournisseurs avec comme intitulé NOM et VILLE." },
            new Question { Id = 3, QuizId = 1, Order = 3, Body = "On veut le nom des fournisseurs dont la ville est London ou Paris." },
            new Question { Id = 4, QuizId = 1, Order = 4, Body = "On veut le nom des fournisseurs dont le statut vaut strictement moins de 25 et qui sont de Paris." },
            new Question { Id = 5, QuizId = 1, Order = 5, Body = "On veut obtenir le nom des fournisseurs dont le statut n'est pas dans l'intervalle fermé [15,25]. Autrement dit, le statut doit être strictement inférieur à 15 ou strictement supérieur à 25." },
            new Question { Id = 6, QuizId = 1, Order = 6, Body = "On veut obtenir les noms des pièces rouges ou bleues. On ne veut pas de doublon." }
        );

        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 1, QuestionId = 1, Order = 1, Sql = "SELECT * FROM s" },
            new Solution { Id = 2, QuestionId = 2, Order = 1, Sql = "SELECT sname NOM, city VILLE FROM s" },
            new Solution { Id = 3, QuestionId = 3, Order = 1, Sql = "SELECT sname\n FROM s \n WHERE city='London' OR city='Paris'" },
            new Solution { Id = 4, QuestionId = 3, Order = 2, Sql = "SELECT sname\n FROM s \n WHERE city IN ('London', 'Paris')" },
            new Solution { Id = 5, QuestionId = 4, Order = 1, Sql = "SELECT sname\n FROM s \n WHERE status < 25 AND city='Paris'" },
            new Solution { Id = 6, QuestionId = 5, Order = 1, Sql = "SELECT sname\n FROM s \n WHERE status NOT BETWEEN 15 AND 25" },
            new Solution { Id = 7, QuestionId = 5, Order = 2, Sql = "SELECT sname\n FROM s \n WHERE status < 15 OR status >25" },
            new Solution { Id = 8, QuestionId = 5, Order = 3, Sql = "SELECT sname\n FROM s \nWHERE NOT(status >= 15 AND status <= 25)\n -- si on applique de Morgan, on retrouve la solution 2" },
            new Solution { Id = 9, QuestionId = 6, Order = 1, Sql = "SELECT DISTINCT PNAME FROM p WHERE  Color = 'RED' OR Color = 'BLUE'" },
            new Solution { Id = 10, QuestionId = 6, Order = 2, Sql = "SELECT DISTINCT PNAME FROM p WHERE Color IN ('RED', 'BLUE')" }
        );

        /* ----------  Questions/Quiz2   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 7, QuizId = 2, Order = 1, Body = "Affichez l'identifiant des livraisons qui concernent un produit rouge." },
            new Question { Id = 8, QuizId = 2, Order = 2, Body = "Affichez le nom des fournisseurs qui fournissent le produit P4" },
            new Question { Id = 9, QuizId = 2, Order = 3, Body = "Affichez le nom des clients/projets qui utilisent le produit P3" },
            new Question { Id = 10, QuizId = 2, Order = 4, Body = "Affichez le nom des projets fournis par le fournisseur S1" },
            new Question { Id = 11, QuizId = 2, Order = 5, Body = "Affichez le nom des fournisseurs qui ont fait au moins une livraison d'entre 150 et 250 pièces" },
            new Question { Id = 12, QuizId = 2, Order = 6, Body = @"On souhaite obtenir l'affichage des livraisons avec le nom du fournisseur à la place de son identifiant,
            ainsi que le nom de la pièce à la place de son identifiant et le nom du projet à la place de son identifiant.
            La date de dernière livraison ne doit pas figurer dans le résultat.
            Par contre l'entête affichée doit être `NOM`, `PIECE`, `PROJET` et `QUANTITE`.
            Par exemple :
            NOM    PIECE    PROJET    QUANTITE
            Smith  Nut      Sorter    200
            Smith  Nut      Console   700
            …      …        …         …
            "},
            new Question { Id = 13, QuizId = 2, Order = 7, Body = @"Même requête où l'on ne garde que les fournisseurs de Paris" },
            new Question { Id = 14, QuizId = 2, Order = 8, Body = @"Affichez les villes des projets où le fournisseur Adams a livré.
                                                                Attention, vous ne pouvez pas faire d'hypothèse sur les données : vous ne pouvez pas considérer que Adams est le fournisseur S5." },
            new Question { Id = 15, QuizId = 2, Order = 9, Body = @"On souhaite le nom des pièces dont le poids est strictement inférieur à 18 livres et qui sont fournies par un fournisseur de Rome ou de Londres.
                                                                Même remarque : vous ne pouvez pas supposer qu'il n'y a pas de fournisseur à Rome." },
            new Question { Id = 16, QuizId = 2, Order = 10, Body = @"Obtenir l'identifiant des pièces de Londres qui ont étés livrées par un fournisseur de Londres" }
        );

        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 11, QuestionId = 7, Order = 1, Sql = "SELECT l.ID_S, l.ID_P, l.ID_J \nFROM SPJ l, P p \nWHERE l.ID_P = p.ID_P AND p.Color = 'Red'" },
            new Solution { Id = 12, QuestionId = 7, Order = 2, Sql = "-- sans renommage\n SELECT ID_S, SPJ.ID_P, ID_J \nFROM SPJ, P \nWHERE SPJ.ID_P = P.ID_P AND P.Color = 'Red'" },
            new Solution { Id = 13, QuestionId = 8, Order = 1, Sql = "SELECT DISTINCT s.SNAME \nFROM S s, SPJ l \n WHERE s.ID_S = l.ID_S AND l.ID_P = 'P4'" },
            new Solution { Id = 14, QuestionId = 9, Order = 1, Sql = "SELECT DISTINCT j.JNAME\n FROM J j, SPJ l \nWHERE j.ID_J = l.ID_J AND l.ID_P = 'P3'" },
            new Solution { Id = 15, QuestionId = 10, Order = 1, Sql = "SELECT DISTINCT j.JNAME\n FROM J j, SPJ l \nWHERE j.ID_J = l.ID_J AND l.ID_S = 'S1'" },
            new Solution { Id = 16, QuestionId = 11, Order = 1, Sql = "SELECT DISTINCT S.SNAME\n FROM S, SPJ \nWHERE S.ID_S = SPJ.ID_S AND QTY BETWEEN 150 AND 250" },
            new Solution { Id = 17, QuestionId = 12, Order = 1, Sql = @" -- On veut :
            -- NOM    PIECE    PROJET    QUANTITE
            -- Smith  Nut     Sorter    200
            -- Smith  Nut      Console   700
            -- ...
            -- au lieu de :
            -- S1 P1 J1 200
            -- S1 P1 J4 700
            -- ...
            SELECT DISTINCT s.SNAME NOM, p.PNAME PIECE, j.JNAME PROJET, l.QTY QUANTITE
            FROM P p, S s, J j, SPJ l
            WHERE l.ID_P = p.ID_P
                AND l.ID_S = s.ID_S
                AND l.ID_J = j.ID_J
            -- 4 tables --> 3 jointures
            -- Le distinct est nécessaire pour éviter un doublon dans le cas (peu probable, mais possible)
            -- où on aurait deux livraisons de même quantité pour deux pièces ayant le même nom, deux
            -- fournisseurs ayant le même nom et/ou deux projets ayant le même nom. " },
            new Solution { Id = 18, QuestionId = 13, Order = 1, Sql = @"SELECT DISTINCT s.SNAME NOM, p.PNAME PIECE, j.JNAME PROJET, l.QTY QUANTITE
                FROM P p, S s, J j, SPJ l
                WHERE l.ID_P = p.ID_P
                AND l.ID_S = s.ID_S
                AND l.ID_J = j.ID_J
                AND s.CITY = 'Paris'" },
            new Solution { Id = 19, QuestionId = 14, Order = 1, Sql = @"SELECT DISTINCT j.City
                FROM S s, J j, SPJ l
                WHERE l.ID_S = s.ID_S
                AND l.ID_J = j.ID_J
                AND s.SNAME = 'Adams'" },
            new Solution { Id = 20, QuestionId = 15, Order = 1, Sql = @"SELECT DISTINCT p.PNAME
                WHERE l.ID_P = p.ID_P
                FROM P p, S s, SPJ l
                AND l.ID_S = s.ID_S
                AND p.WEIGHT < 18
                AND (s.CITY = 'Rome' OR s.CITY = 'London')" },
            new Solution { Id = 21, QuestionId = 16, Order = 1, Sql = @"SELECT DISTINCT p.ID_P
                FROM P p, S s, SPJ l
                WHERE l.ID_P = p.ID_P
                AND l.ID_S = s.ID_S
                AND p.CITY = 'London'
                AND s.CITY = 'London'" }
        );

        /* ----------  Questions/Quiz3   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 20, QuizId = 3, Order = 1, Body = @"Affichez le nom des personnes qui ont plus de trente ans" }
        );
        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 22, QuestionId = 20, Order = 1, Sql = "SELECT DISTINCT p.Nom \nFROM Personne p \nWHERE p.Age >= 30;" }
        );

        /* ----------  Questions/Quiz4   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 30, QuizId = 4, Order = 1, Body = @"On veut afficher le contenu de la table des fournisseurs." },
            new Question { Id = 31, QuizId = 4, Order = 2, Body = @"On veut le nom et la ville de tous les fournisseurs avec comme intitulé NOM et VILLE." }
        );
        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 23, QuestionId = 30, Order = 1, Sql = "SELECT * FROM s" },
            new Solution { Id = 24, QuestionId = 31, Order = 1, Sql = "SELECT sname NOM, city VILLE FROM s" }
        );

        /* ----------  Questions/Quiz5   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 32, QuizId = 5, Order = 1, Body = @"On veut le nom et la ville de tous les fournisseurs avec comme intitulé NOM et VILLE." }
        );
        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 25, QuestionId = 32, Order = 1, Sql = "SELECT sname NOM, city VILLE FROM s" }
        );

        /* ----------  Questions/Quiz6   -------- */
        modelBuilder.Entity<Question>().HasData(
            new Question { Id = 33, QuizId = 6, Order = 1, Body = @"Affichez le nom des personnes qui ont plus de trente ans" },
            new Question { Id = 34, QuizId = 6, Order = 2, Body = @"Affichez la date d'expédition des messages envoyés par Paul" }
        );
        modelBuilder.Entity<Solution>().HasData(
            new Solution { Id = 26, QuestionId = 33, Order = 1, Sql = "SELECT DISTINCT p.Nom \nFROM Personne p \nWHERE p.Age >= 30;" },
            new Solution { Id = 27, QuestionId = 34, Order = 1, Sql = "SELECT DISTINCT m.Date_Expedition \nFROM message m \n\tJOIN personne p ON p.SSN = m.Expediteur \nWHERE p.Nom = 'Paul';" }
        );


        /* ----------  Attempt 1   -------- */
        modelBuilder.Entity<Attempt>().HasData(
            new Attempt { Id = 1, Start = new DateTime(2023, 09, 01), QuizId = 1, StudentId = 8 }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { Id = 1, QuestionId = 1, AttemptId = 1, Sql = "SELECT * FROM S", IsCorrect = true }
        );

        /* ----------  Attempt 2  -------- */
        modelBuilder.Entity<Attempt>().HasData(
            new Attempt { Id = 2, Start = DateTime.Now, Finish = DateTime.Now, QuizId = 4, StudentId = 8 }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { Id = 2, QuestionId = 30, AttemptId = 2, Sql = "SELECT * FROM S", IsCorrect = true }
        );
        modelBuilder.Entity<Answer>().HasData(
            new Answer { Id = 3, QuestionId = 31, AttemptId = 2, Sql = "SELECT * FROM J", IsCorrect = false }
        );

    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Attempt> Attempts => Set<Attempt>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Answer> Answers => Set<Answer>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Solution> Solutions => Set<Solution>();
    public DbSet<Database> Databases => Set<Database>();

}
