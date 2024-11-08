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
public class QuestionController :  ControllerBase{
    private readonly PridContext _context;
    private readonly IMapper _mapper;
    private readonly TokenHelper _tokenHelper;


    public QuestionController(PridContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
        _tokenHelper = new TokenHelper(context);
    }

    // GET: api/Questions

    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAll() {
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions
            .Include(q => q.Quiz)
            .Include(q => q.Solutions)
            .Include(q => q.Answers)
            .ToListAsync());
    }

    // GET: api/Question/id

    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionDTO>> GetOne(int id) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        Console.WriteLine(" QUESTION!!! id : " + id);
        var question = await _context.Questions
            .Include(q => q.Quiz)
            .Include(q => q.Solutions)
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (question == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<QuestionDTO>(question);
    }

    // GET: api/question/id/quiz

    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{id}/quiz")]
    public async Task<ActionResult<QuizDTO>> GetQuiz(int id) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var question = await _context.Questions
            .Include(q => q.Solutions)
            .Include(q => q.Quiz)
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (question == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<QuizDTO>(question.Quiz);
    }


    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getdata/{dbname}")]
    public ActionResult<Dictionary<string, List<string>>> GetData(string dbname) {

        string connectionString = $"server=localhost;database={dbname};uid=root;password=root";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        List<string> tableNames = new List<string>();

        try {
            connection.Open();
            DataTable schema = connection.GetSchema("Tables");

            foreach (DataRow row in schema.Rows) {
                string? tableName = row["TABLE_NAME"]?.ToString();
                if (tableName != null) {
                    tableNames.Add(tableName);
                }
            }
        } catch (Exception e) {
            Console.WriteLine($"-->Error: {e.Message}");
        }

        return Ok(tableNames);
    }


    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("GetColumns/{dbName}")]
    public ActionResult<Dictionary<string, List<string>>> GetColumns(string dbName) {
        string connectionString = $"server=localhost;database={dbName};uid=root;password=root";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        List<string> columnNames = new List<string>();

        try {
            connection.Open();
            DataTable schema = connection.GetSchema("Columns");

            foreach (DataRow row in schema.Rows) {
                string? columnName = row["COLUMN_NAME"].ToString();
                if (columnName != null)
                    columnNames.Add(columnName);
            }
        } catch (Exception e) {
            Console.WriteLine($"--> Error: {e.Message}");
        }

        return Ok(columnNames);
    }

    
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpPost("queryPost")]
    public async Task<ActionResult<object>> Sql(SqlDTO sqldto){
        //recupere la premiere solution de la question
        Solution?  firstSolution = await _context.Solutions
                                .FirstOrDefaultAsync(s => s.QuestionId == sqldto.QuestionId);

        if (firstSolution  == null){
            // Si aucune solution n'a été trouvée, renvoi une erreur 404 Not Found
            return NotFound();
        }
        Console.WriteLine("---> first Solution  : " + firstSolution );
        SqlDTO sqlQuery = new() { //creation d'un objet SqlDTO pour la solution --> new SqlDTO()
            QuestionId = sqldto.QuestionId,
            Query = firstSolution.Sql ,
            DbName = sqldto.DbName
        };

        QueryDTO query = sqldto.ExecuteQuery(); //execute la requete de l'utilisateur

        if(query.Error.Count > 0) //si il y a une erreur dans la requete de l'utilisateur
            return query;

        QueryDTO solutionQuery = sqlQuery.ExecuteQuery();

        if (query.Data is not null && solutionQuery.Data is not null)
            query.CheckQueries(solutionQuery);
        else
            query.Error = new string[] { "Errors while sending the data" }.ToList();
        return query;
    }

    // delete: api/question/id
    [Authorized(Role.Teacher, Role.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) {
        var question = await _context.Questions.FindAsync(id);
        if (question == null)
            return NotFound();
        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();
        return NoContent();
    }

}
