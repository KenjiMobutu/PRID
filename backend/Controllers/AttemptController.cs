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
public class AttemptController : ControllerBase{

  private readonly PridContext _context;
  private readonly IMapper _mapper;
  private readonly TokenHelper _tokenHelper;

  public AttemptController(PridContext context, IMapper mapper) {
    _context = context;
    _mapper = mapper;
    _tokenHelper = new TokenHelper(context);
  }

  // GET: api/Attempts
  [AllowAnonymous]
  [HttpGet]
  public async Task<ActionResult<IEnumerable<AttemptDTO>>> GetAll() {
    return _mapper.Map<List<AttemptDTO>>(await _context.Attempts
        .Include(a => a.Quiz)
        .Include(a => a.Answers)
        .ToListAsync());
  }

  // GET: api/Attempt/id
  [AllowAnonymous]
  [HttpGet("{id}")]
  public async Task<ActionResult<AttemptDTO>> GetOne(int id) {
    // Récupère en BD l'attempt dont l'id est passé en paramètre dans l'url
    var attempt = await _context.Attempts.FindAsync(id);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (attempt == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<AttemptDTO>(attempt);
  }

  // GET: api/attempt/id/answers
  [AllowAnonymous]
  [HttpGet("{id}/answers")]
  public async Task<ActionResult<IEnumerable<AnswerDTO>>> GetAnswers(int id) {
    // Récupère en BD l'attempt dont l'id est passé en paramètre dans l'url
    var attempt = await _context.Attempts.FindAsync(id);
    // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
    if (attempt == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<List<AnswerDTO>>(attempt.Answers);
  }

  // GET: api/attempt/quizId/attempts
  [AllowAnonymous]
  [HttpGet("{quizId}/attempts")]
  public async Task<ActionResult<IEnumerable<AttemptDTO>>> GetAttemptsByQuizId(int quizId) {
    // Récupère en BD les attempts dont l'id du quiz est passé en paramètre dans l'url
    var quiz = await _context.Quizzes
    .Include(q => q.Attempts)
    .ThenInclude(a => a.Answers)
    .FirstOrDefaultAsync(q => q.Id == quizId);

    // Si aucune question n'a été trouvée, renvoyer une erreur 404 Not Found
    if (quiz == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<List<AttemptDTO>>(quiz.Attempts);
  }

  // GET: api/attempt/quizId/studentId/attempt
  [AllowAnonymous]
  [HttpGet("{quizId}/{studentId}/attempt")]
  public async Task<ActionResult<AttemptDTO>> GetByQuizIdAndStudentId(int quizId, int studentId) {
    // Récupère en BD les attempts dont l'id du quiz est passé en paramètre dans l'url
    var attempt = await _context.Attempts
            .Include(a => a.Quiz)
            .Include(a => a.Student)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.QuizId == quizId && a.StudentId == studentId);

    // Si aucune question n'a été trouvée, renvoyer une erreur 404 Not Found
    if (attempt == null)
      return NotFound();
    // Retourne le membre
    return _mapper.Map<AttemptDTO>(attempt);
  }
}
