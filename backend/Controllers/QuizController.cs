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
using System.Xml.Serialization;

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
    // [AllowAnonymous]
    // [HttpGet("tp")]
    // public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTp() {
    //     return _mapper.Map<List<QuizDTO>>(await _context.Quizzes
    //         .Include(q => q.Database)
    //         .Include(q => q.Questions)
    //         .Include(q => q.Attempts)
    //         .Where(q => q.IsTest == false)
    //         .OrderBy(q => q.Name)
    //         .ToListAsync());
    // }
    [AllowAnonymous]
    [HttpGet("{userId}/tp")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTp(int userId){ // Ajoutez userId comme paramètre si nécessaire
        var quizzes = await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .Where(q => q.IsTest == false)
            .OrderBy(q => q.Name)
            .ToListAsync();

        var quizzesDto = _mapper.Map<List<QuizDTO>>(quizzes);

        Console.WriteLine(" QUIZZZZ ---> " + " :" + quizzesDto.Count);
        quizzesDto.ForEach((q) => Console.WriteLine(" QUIZZZZ ---> " + " :" + q.Name + " " + q.Finish));
        // Mettre à jour le statut pour chaque quiz en fonction de l'utilisateur
        await UserQuizStatus(quizzesDto, userId);

        return quizzesDto;
    }


    // GET: api/quiz/test
    [AllowAnonymous]
    [HttpGet("{userId}/test")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest(int userId) {
        var quizzes = await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .Include(q => q.Attempts)
            .Where(q => q.IsTest == true)
            .OrderBy(q => q.Name)
            .ToListAsync();

        var quizzesDto = _mapper.Map<List<QuizDTO>>(quizzes);

        Console.WriteLine(" QUIZZZZ ---> " + " :" + quizzesDto.Count);
        quizzesDto.ForEach((q) => Console.WriteLine(" QUIZZZZ ---> " + " :" + q.Name + " score -> " + q.Score));
        // Mettre à jour le statut pour chaque quiz en fonction de l'utilisateur
        await UserQuizStatus(quizzesDto, userId);

        return quizzesDto;
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
    private async Task UserQuizStatus(List<QuizDTO> quizzes, int userId){
        DateTime now = DateTime.Now;

        var attempts = await _context.Attempts
            .Where(a => quizzes.Select(q => q.Id).Contains(a.QuizId) && a.StudentId == userId)
            .OrderByDescending(a => a.Finish)
            .ToListAsync();

        var questionsCount = await _context.Questions
            .Where(q => quizzes.Select(q => q.Id).Contains(q.QuizId))
            .GroupBy(q => q.QuizId)
            .Select(g => new { QuizId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(q => q.QuizId, q => q.Count);

        foreach (var quiz in quizzes){
            QuizStatus determinedStatus;

            if (quiz.Finish.HasValue && now > quiz.Finish){
                determinedStatus = QuizStatus.Cloture;
                quiz.IsClosed = true;
                quiz.Score = "N/A";
            }else{
                var attempt = attempts.FirstOrDefault(a => a.QuizId == quiz.Id);
                if (attempt != null){
                    quiz.HaveAttempt = true;
                    if (attempt is not null  && quiz.IsTest){
                        determinedStatus = QuizStatus.Fini;
                        if (quiz.IsTest && questionsCount.TryGetValue(quiz.Id, out var totalQuestions)){
                            var correctAnswersCount = await _context.Answers
                                .Where(a => a.AttemptId == attempt.Id && a.IsCorrect)
                                .CountAsync();

                            quiz.Score = ((double)correctAnswersCount / totalQuestions * 10).ToString() + "/10";
                        }
                    }else if (!quiz.IsTest && !quiz.IsClosed){
                        determinedStatus = QuizStatus.EnCours;
                    }else{
                        determinedStatus = QuizStatus.Fini;
                    }
                }else if (quiz.IsTest || quiz.IsClosed){
                    determinedStatus = QuizStatus.PasCommence;
                    quiz.Score = "N/A";
                }else{
                    determinedStatus = QuizStatus.PasCommence;
                }
            }

            quiz.SetExternalStatus(determinedStatus);
            Console.WriteLine("--> statut : " + determinedStatus);
        }
    }


}
