using Microsoft.EntityFrameworkCore;
using prid_2324_a11.Models;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using prid_2324_a11.Helpers;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using MySql.Data.MySqlClient;
using System.Data;

namespace prid_2324_a11.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]

public class SolutionController : ControllerBase{

  private readonly PridContext _context;
  private readonly IMapper _mapper;
  private readonly TokenHelper _tokenHelper;

  public SolutionController(PridContext context, IMapper mapper) {
    _context = context;
    _mapper = mapper;
    _tokenHelper = new TokenHelper(context);
  }

  // GET: api/Solutions
  [AllowAnonymous]
  [HttpGet]
  public async Task<ActionResult<IEnumerable<SolutionDTO>>> GetAll() {
    return _mapper.Map<List<SolutionDTO>>(await _context.Solutions
        .Include(s => s.Question)
        .ToListAsync());
  }

  // GET: api/Solution/id
  [AllowAnonymous]
  [HttpGet("{id}")]
  public async Task<ActionResult<SolutionDTO>> GetOne(int id) {
    // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
    var solution = await _context.Solutions.FindAsync(id);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (solution == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<SolutionDTO>(solution);
  }

  // GET: api/solution/id/solutions
  [AllowAnonymous]
  [HttpGet("{id}/solutions")]
  public async Task<ActionResult<IEnumerable<SolutionDTO>>> GetByQuestionId(int id) {
    // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
    var question = await _context.Questions
            .Include(q => q.Quiz)
            .Include(q => q.Solutions)
            .FirstOrDefaultAsync(q => q.Id == id);
    var solution = await _context.Solutions
        .FirstOrDefaultAsync(s => s.QuestionId == question.Id);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (solution == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<List<SolutionDTO>>(question.Solutions);
  }

    [AllowAnonymous]
    [HttpGet("{id}/{sql}")]
    public ActionResult CheckSql(int id,string sql){
      // Exécutez la requête SQL avec la chaîne sql
        string connectionString = "server=localhost;database=fournisseurs;uid=root;password=root";
        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table;
      try{
        Console.WriteLine("---> sql: " + sql);
        connection.Open();
        MySqlCommand command = new MySqlCommand("SET sql_mode = 'STRICT_ALL_TABLES'; " + sql, connection);
        MySqlDataAdapter adapter = new MySqlDataAdapter(command);
        table = new DataTable();
        adapter.Fill(table);
        // Comparer les données avec les solutions associées à la question
        // récupérer les solutions associées à la question
        List<Solution> solutions = RetrieveSolutionsForQuestion(id);
        // Afficher les solutions en console
        foreach (Solution solution in solutions){
          Console.WriteLine("---> solution: " + solution.Sql);
        }
        // Comparer les données de la requête SQL avec les solutions
        bool isValid = CompareDataWithSolutions(table, solutions);
        Console.WriteLine("---> isValid: " + isValid);
        if (isValid){
            return Ok(new { message = "Requête SQL valide." });
        }else{
            return BadRequest("Requête SQL invalide." );
        }
    }catch (Exception e){
        return BadRequest("Erreur lors de l'exécution de la requête SQL : " + e.Message);
    }
  }

  private List<Solution> RetrieveSolutionsForQuestion(int questionId){
    // Retourne une liste de solutions
    List<Solution> solutions = _context.Solutions.Where(s => s.QuestionId == questionId).ToList();
    return solutions;
  }

  private bool CompareDataWithSolutions(DataTable data, List<Solution> solutions){
    // Parcourir les données et les solutions pour vérifier si elles correspondent
    // Retourner true si une correspondance est trouvée, sinon retournez false
     // Parcourir les solutions
    foreach (var solution in solutions){
        // Exécutez la solution SQL et obtenez les données
        DataTable? solutionData = ExecuteSql(solution.Sql);
        // Comparez les données de la solution avec les données de la requête SQL
        if (AreDataEqual(data, solutionData??new DataTable())){
            return true; // Correspondance trouvée, la requête SQL est valide
        }
    }
    return false; // Aucune correspondance trouvée avec les solutions
  }

  private DataTable? ExecuteSql(string sql){
    // Exécutez la requête SQL et retournez les données sous forme de DataTable
    // Vous pouvez utiliser le code que vous avez déjà fourni pour exécuter la requête SQL
    // et remplir un DataTable
    // Assurez-vous de gérer les erreurs potentielles ici
    try{
        string connectionString = "server=localhost;database=fournisseurs;uid=root;password=root";
        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table;
        connection.Open();
        MySqlCommand command = new MySqlCommand("SET sql_mode = 'STRICT_ALL_TABLES'; " + sql, connection);
        MySqlDataAdapter adapter = new MySqlDataAdapter(command);
        table = new DataTable();
        adapter.Fill(table);
        return table;
    }catch (Exception){
        // Gérez les erreurs d'exécution de la requête SQL ici
        // Vous pouvez choisir de renvoyer null ou de lever une exception personnalisée
        return null;
    }
  }

  private bool AreDataEqual(DataTable data1, DataTable data2){
    // Comparez les deux DataTable pour vérifier s'ils sont égaux
    // Vous pouvez personnaliser cette méthode en fonction de vos besoins
    // Par exemple, vérifiez si les données dans data1 sont identiques à celles dans data2
    // en parcourant les lignes et les colonnes de chaque DataTable
    // Si les données sont identiques, retournez true ; sinon, retournez false

    // Exemple de comparaison simple (compare le contenu des DataTable)
    if (data1.Rows.Count != data2.Rows.Count || data1.Columns.Count != data2.Columns.Count){
        return false;
    }

    for (int i = 0; i < data1.Rows.Count; i++){
        for (int j = 0; j < data1.Columns.Count; j++){
            if (!data1.Rows[i][j].Equals(data2.Rows[i][j])){
                return false;
            }
        }
    }
    return true;
  }
}
