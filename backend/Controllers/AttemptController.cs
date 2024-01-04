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
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
  [HttpGet]
  public async Task<ActionResult<IEnumerable<AttemptDTO>>> GetAll() {
    return _mapper.Map<List<AttemptDTO>>(await _context.Attempts
        .Include(a => a.Quiz)
        .Include(a => a.Answers)
        .ToListAsync());
  }

  // GET: api/Attempt/id
  [AllowAnonymous]
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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

  // GET: api/attempt/attemptId/answers
  [AllowAnonymous]
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
[Authorized(Role.Teacher, Role.Admin, Role.Student)]
[HttpGet("{quizId}/{studentId}/attempt")]
public async Task<ActionResult<IEnumerable<AttemptDTO>>> GetByQuizIdAndStudentId(int quizId, int studentId) {
  // Récupère en BD les attempts correspondants aux critères
  var attempts = await _context.Attempts
          //.Include(a => a.Quiz)
          //.Include(a => a.Student)
          //.Include(a => a.Answers)
          .Where(a => a.QuizId == quizId && a.StudentId == studentId)
          .ToListAsync();

  // Si aucune tentative n'a été trouvée, renvoyer une erreur 404 Not Found
  if (attempts == null || !attempts.Any())
    return NotFound();

  // Convertit les entités en DTO
  return _mapper.Map<List<AttemptDTO>>(attempts);
}


  // POST: api/Attempts
  [AllowAnonymous]
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
  [HttpPost("{quizId}/{studentId}")]
  public async Task<ActionResult<AttemptDTO>> PostAttempt(int quizId, int studentId) {
    // Récupère en BD le quiz dont l'id est passé en paramètre dans l'url
    var newAttempt = new Attempt {
      Start = DateTime.Now,
      StudentId = studentId,
      QuizId = quizId,
    };
    _context.Attempts.Add(newAttempt);
    // Sauvegarder les changements
    await _context.SaveChangesAsync();
    var attemptDTO = _mapper.Map<AttemptDTO>(newAttempt);
    // Retourner le DTO de l'attempt
    return CreatedAtAction(nameof(GetOne), new { id = attemptDTO.Id }, attemptDTO);
  }

  //PUT: api/attempt/attemptId/finish
  [AllowAnonymous]
  [Authorized(Role.Teacher, Role.Admin, Role.Student)]
  [HttpPut("{attemptId}/finish")]
  public async Task<ActionResult<AttemptDTO>> PutAttempt(int attemptId) {
    // Récupère en BD l'attempt dont l'id est passé en paramètre dans l'url
    var attempt = await _context.Attempts.FindAsync(attemptId);
    // Si aucun attempt n'a été trouvé, renvoyer une erreur 404 Not Found
    if (attempt == null)
      return NotFound();
    attempt.Finish = DateTime.Now;
    // Sauvegarder les changements
    await _context.SaveChangesAsync();
    var attemptDTO = _mapper.Map<AttemptDTO>(attempt);
    // Retourner le DTO de l'attempt
    return CreatedAtAction(nameof(GetOne), new { id = attemptDTO.Id }, attemptDTO);
  }
}
