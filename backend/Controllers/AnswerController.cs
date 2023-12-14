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
public class AnswerController : ControllerBase{

  private readonly PridContext _context;
  private readonly IMapper _mapper;
  private readonly TokenHelper _tokenHelper;

  private string[]? columnNames;
  private string[][]? dataRows;

  public AnswerController(PridContext context, IMapper mapper) {
    _context = context;
    _mapper = mapper;
    _tokenHelper = new TokenHelper(context);
  }

  // GET: api/questionId/answer
  [AllowAnonymous]
  [HttpGet("{questionId}/answer")]
  public async Task<ActionResult<IEnumerable<AnswerDTO>>> GetAnswers(int questionId) {
    // Récupère en BD la question dont l'id est passé en paramètre dans l'url
    var question = await _context.Questions.FindAsync(questionId);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (question == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<List<AnswerDTO>>(await _context.Answers
        .Where(a => a.QuestionId == questionId)
        .ToListAsync());
  }

  // GET: api/attemptId/answers
  [AllowAnonymous]
  [HttpGet("{attemptId}/answers")]
  public async Task<ActionResult<IEnumerable<AnswerDTO>>> GetByAttemptId(int attemptId) {
    // Récupère en BD l'attempt dont l'id est passé en paramètre dans l'url
    var attempt = await _context.Attempts.FindAsync(attemptId);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (attempt == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<List<AnswerDTO>>(await _context.Answers
        .Where(a => a.AttemptId == attemptId)
        .ToListAsync());
  }

  // GET: api/answer/id
  [AllowAnonymous]
  [HttpGet("{id}")]
  public async Task<ActionResult<AnswerDTO>> GetOne(int id) {
    // Récupère en BD la réponse dont l'id est passé en paramètre dans l'url
    var answer = await _context.Answers.FindAsync(id);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (answer == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<AnswerDTO>(answer);
  }

    [AllowAnonymous]
    [HttpGet("{id}/{sql}/{dbName}")]
    // Vérifie si la requête SQL est valide
    public ActionResult CheckSql(int id,string sql,string dbName){
      // Exécute la requête SQL avec la chaîne sql
        string connectionString = $"server=localhost;database={dbName};uid=root;password=root";
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
        bool isValid = CompareDataWithSolutions(table, solutions,dbName);
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

  private bool CompareDataWithSolutions(DataTable data, List<Solution> solutions,string dbName){
    // Parcourir les données et les solutions pour vérifier si elles correspondent
    // Retourne true si une correspondance est trouvée, sinon retourne false
     // Parcourir les solutions
    foreach (var solution in solutions){
        // Exécute la solution SQL et obtenir les données
        DataTable? solutionData = ExecuteSql(solution.Sql,dbName);
        // Compare les données de la solution avec les données de la requête SQL
        if (AreDataEqual(data, solutionData??new DataTable())){
            return true; // Correspondance trouvée, la requête SQL est valide
        }
    }
    return false; // Aucune correspondance trouvée avec les solutions
  }

  private DataTable? ExecuteSql(string sql,string dbName){
    // Exécute la requête SQL et retourne les données sous forme de DataTable
    try{
        string connectionString = $"server=localhost;database={dbName};uid=root;password=root";
        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table;
        connection.Open();
        MySqlCommand command = new MySqlCommand("SET sql_mode = 'STRICT_ALL_TABLES'; " + sql, connection);
        MySqlDataAdapter adapter = new MySqlDataAdapter(command);
        table = new DataTable();
        adapter.Fill(table);
        Console.WriteLine("---> table: " + table);
        return table;
    }catch (Exception){
        return null;
    }
  }

  private bool AreDataEqual(DataTable data1, DataTable data2){
    // Compare les deux DataTable pour vérifier s'ils sont égaux
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

  // Récupère les noms des colonnes d'un DataTable
  [AllowAnonymous]
  [HttpGet("{sql}/{dbName}/columns")]
  public ActionResult<string[]> GetColumnNames(string sql,string dbName){
    string connectionString = $"server=localhost;database={dbName};uid=root;password=root";
    using MySqlConnection connection = new MySqlConnection(connectionString);
    DataTable table;
    connection.Open();
    MySqlCommand command = new MySqlCommand("SET sql_mode = 'STRICT_ALL_TABLES'; " + sql, connection);
    MySqlDataAdapter adapter = new MySqlDataAdapter(command);
    table = new DataTable();
    adapter.Fill(table);
    Console.WriteLine("---> table: " + table);
    columnNames = new string[table.Columns.Count];
    for (int i = 0; i < table.Columns.Count; i++){
        columnNames[i] = table.Columns[i].ColumnName;
        Console.WriteLine("---> columns Names: " + columnNames[i]);
    }
    return columnNames;
  }

  // Récupère les données d'un DataTable
  [AllowAnonymous]
  [HttpGet("{sql}/{dbName}/rows")]
  public ActionResult<string[][]> GetDataRows(string sql,string dbName){
    string connectionString = $"server=localhost;database={dbName};uid=root;password=root";
    using MySqlConnection connection = new MySqlConnection(connectionString);
    DataTable table;
    connection.Open();
    MySqlCommand command = new MySqlCommand("SET sql_mode = 'STRICT_ALL_TABLES'; " + sql, connection);
    MySqlDataAdapter adapter = new MySqlDataAdapter(command);
    table = new DataTable();
    adapter.Fill(table);
    dataRows = new string[table.Rows.Count][];
    for (int i = 0; i < table.Rows.Count; i++){
        dataRows[i] = new string[table.Columns.Count];
        for (int j = 0; j < table.Columns.Count; j++){
            object value = table.Rows[i][j];
            string str;
            if (value == null)
                str = "NULL";
            else {
                if (value is DateTime d) {
                    if (d.TimeOfDay == TimeSpan.Zero)
                        str = d.ToString("yyyy-MM-dd");
                    else
                        str = d.ToString("yyyy-MM-dd hh:mm:ss");
                } else
                    str = value?.ToString() ?? "";
            }
            dataRows[i][j] = str;
            Console.WriteLine("---> dataRows: " + dataRows[i][j]);
        }
    }
    Console.WriteLine("---> dataRows COUNT : " + dataRows.Count());
    return dataRows;
  }
}
