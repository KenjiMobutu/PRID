using AutoMapper;
using AutoMapper.EquivalencyExpression;
using Microsoft.EntityFrameworkCore;
using prid_tuto.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<MsnContext>(opt => opt.UseSqlite("Data Source=msn.db"));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Auto Mapper Configurations
builder.Services.AddScoped(provider => new MapperConfiguration(cfg => {
        cfg.AddProfile(new MappingProfile(provider.GetService<MsnContext>()!));
        // see: https://github.com/AutoMapper/AutoMapper.Collection
        cfg.AddCollectionMappers();
        cfg.UseEntityFrameworkCoreModel<MsnContext>(builder.Services);
    }).CreateMapper());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed the database
using var scope = app.Services.CreateScope();
using var context = scope.ServiceProvider.GetService<MsnContext>();
if (context?.Database.IsSqlite() == true)
    /*
    La suppression complète de la base de données n'est pas possible si celle-ci est ouverte par un autre programme,
    comme par exemple "DB Browser for SQLite" car les fichiers correspondants sont verrouillés.
    Pour contourner ce problème, on exécute cet ensemble de commandes qui vont supprimer tout le contenu de la DB.
    La dernière commande permet de réduire la taille du fichier au minimum.
    (voir https://stackoverflow.com/a/548297)
    */
    context.Database.ExecuteSqlRaw(
        @"PRAGMA writable_schema = 1;
        delete from sqlite_master where type in ('table', 'index', 'trigger', 'view');
        PRAGMA writable_schema = 0;
        VACUUM;");
else
    context?.Database.EnsureDeleted();
context?.Database.EnsureCreated();

app.UseAuthorization();

app.MapControllers();

app.Run();
