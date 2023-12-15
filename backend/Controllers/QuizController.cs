using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2324_a11.Models;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using prid_2324_a11.Helpers;

namespace prid_2324_a11.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class QuizController :  ControllerBase{
    private readonly PridContext _context;
    private readonly IMapper _mapper;
    private readonly TokenHelper _tokenHelper;

    public QuizController(PridContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
        _tokenHelper = new TokenHelper(context);
    }

    // GET: api/Quizes
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAll() {
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .ToListAsync());
    }

    // GET: api/quiz/tp
    [AllowAnonymous]
    [HttpGet("tp")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTp() {
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .Where(q => q.IsTest == false)
            .OrderBy(q => q.Name)
            .ToListAsync());
    }

    // GET: api/quiz/test
    [AllowAnonymous]
    [HttpGet("test")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest() {
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .Where(q => q.IsTest == true)
            .OrderBy(q => q.Name)
            .ToListAsync());
    }

    // GET: api/quiz/id
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDTO>> GetOne(int id) {
        // Récupère en BD le quiz avec ses questions liées
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == id);
        Console.WriteLine(" QUIZZZZ ---> " + " :" + quiz?.Questions.Count);
        // Si aucun quiz n'a été trouvé, renvoyer une erreur 404 Not Found
        if (quiz == null)
            return NotFound();
        // Retourner le quiz avec les questions mappées vers le DTO
        return _mapper.Map<QuizDTO>(quiz);
    }

    // GET: api/quiz/id/questions
    [AllowAnonymous]
    [HttpGet("{id}/questions")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestions(int id) {
        // Récupère en BD le quiz avec ses questions liées
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == id);
        // Si aucun quiz n'a été trouvé, renvoyer une erreur 404 Not Found
        if (quiz == null)
            return NotFound();
        // Retourner le quiz avec les questions mappées vers le DTO
        return _mapper.Map<List<QuestionDTO>>(quiz.Questions);
    }

    // GET: api/quiz/questionId/quiz
    [AllowAnonymous]
    [HttpGet("{id}/quiz")]
    public async Task<ActionResult<QuizDTO>> GetByQuestionId(int id) {
        // Récupère en BD le quiz avec ses questions liées
        var question = await _context.Questions
            .Include(q => q.Quiz)
            .Include(q => q.Quiz.Questions)
            .Include(q => q.Quiz.Database)
            .Include(q => q.Quiz.Attempts)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question == null || question.Quiz == null)
            return NotFound();
        var quizId = question.Quiz.Id;
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == quizId);
        // Si aucun quiz n'a été trouvé, renvoyer une erreur 404 Not Found
        if (question == null)
            return NotFound();
        // Retourner le quiz avec les questions mappées vers le DTO
        return _mapper.Map<QuizDTO>(quiz);
    }

    [AllowAnonymous]
    [HttpPost("close/{quizId}")]
    public async Task<ActionResult<QuizDTO>> CloseQuiz(int quizId) {
    // Trouver le quiz par ID
        var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz != null) {
            quiz.IsClosed = true;
            await _context.SaveChangesAsync();
            return Ok();
        } else {
            return NotFound(); // 404
        }
    }

    [AllowAnonymous]
    [HttpPost("open/{quizId}")]
    public async Task<ActionResult<QuizDTO>> OpenQuiz(int quizId) {
    // Trouver le quiz par ID
        var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId);
        if (quiz != null) {
            quiz.IsClosed = false;
            await _context.SaveChangesAsync();
            return Ok();
        } else {
            return NotFound(); // 404
        }
    }



}
