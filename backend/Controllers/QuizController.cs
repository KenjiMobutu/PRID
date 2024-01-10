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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAll() {
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .ToListAsync());
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("database")]
    public async Task<ActionResult<IEnumerable<DatabaseDTO>>> GetAllDatabase() {
        var databases = await _context.Databases
            .Include(d => d.Quizzes)
            .ToListAsync();
        var databasesDto = _mapper.Map<List<DatabaseDTO>>(databases);
        return databasesDto;
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("teacher/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAllForTeacher(int userId) {
        var quizzes = await _context.Quizzes
            .Include(q => q.Questions)
            .Include(q => q.Database)
            .Include(q => q.Attempts)
            .ToListAsync();

        var quizzesDto = _mapper.Map<List<QuizDTO>>(quizzes);
        await UserQuizStatus(quizzesDto, userId);
        return quizzesDto;
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{userId}/tp")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTp(int userId){ // Ajoutez userId comme paramètre si nécessaire
        var quizzes = await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .ThenInclude(q => q.Solutions)
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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{userId}/test")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest(int userId) {
        var quizzes = await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .ThenInclude(q => q.Solutions)
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

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{userId}/{quizId}/test")]
    public async Task<ActionResult<QuizDTO>> GetTestById(int userId, int quizId) {
        var quiz = await _context.Quizzes
            .Include(q => q.Database)
            .Include(q => q.Questions)
            .ThenInclude(q => q.Solutions)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        var quizDto = _mapper.Map<QuizDTO>(quiz);

        Console.WriteLine(" QUIZZZZ ---> " + " :" + quizDto.Name);
        // Mettre à jour le statut pour chaque quiz en fonction de l'utilisateur
        await UserQuizStatus(new List<QuizDTO> { quizDto }, userId);

        return quizDto;
    }

    // GET: api/quiz/id
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDTO>> GetOne(int id) {
        // Récupère en BD le quiz avec ses questions liées
        var quiz = await _context.Quizzes
            .Include(q => q.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Solutions.OrderBy(s => s.Order))
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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
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
                        if (attempt.Finish is not null  && quiz.IsTest){
                            determinedStatus = QuizStatus.Fini;
                            if (quiz.IsTest && questionsCount.TryGetValue(quiz.Id, out var totalQuestions)){
                                var model = new CalculateQuizScoreModel { Quiz = quiz, Attempt = attempt };
                                var result = await CalculateQuizScore(model);
                                quiz.Score = result;
                            }
                        }else if (!quiz.IsClosed){
                            determinedStatus = QuizStatus.EnCours;
                            quiz.Score = "N/A";
                        }else{
                            determinedStatus = QuizStatus.Fini;
                            if (quiz.IsTest && questionsCount.TryGetValue(quiz.Id, out var totalQuestions)){
                                var model = new CalculateQuizScoreModel { Quiz = quiz, Attempt = attempt };
                                var result = await CalculateQuizScore(model);
                                quiz.Score = result;
                            }
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

    [HttpPost("calculateQuizScore")]
    public async Task<string> CalculateQuizScore([FromBody] CalculateQuizScoreModel model){
        // Récupérer le nombre total de questions dans le quiz
        int totalQuestions = model.Quiz.Questions.Count;

        // Récupérer la dernière réponse pour chaque question
        var latestAnswers = await _context.Answers
            .Where(a => a.AttemptId == model.Attempt.Id)
            .GroupBy(a => a.QuestionId)
            .Select(group => group.OrderByDescending(a => a.Timestamp).First())
            .ToListAsync();
        Console.WriteLine("**** latestAnswers : " + latestAnswers.Count);
        latestAnswers.ForEach((a) => Console.WriteLine("**** latestAnswers : " + a.QuestionId + " " + a.Sql));
        // Calculer le score total du quiz
        double totalScore = 0;

        foreach (var question in model.Quiz.Questions)
        {
            // Vérifier si la dernière réponse pour cette question existe
            var latestAnswer = latestAnswers.FirstOrDefault(a => a.QuestionId == question.Id);
            Console.WriteLine("**** latestAnswer : " + latestAnswer?.QuestionId + " " + latestAnswer?.Sql);
            if (latestAnswer!.IsCorrect)
            {
                // Incrémenter le score en fonction de la présence d'une réponse
                totalScore += 1.0 / totalQuestions * 10;
            }
        }

        // Mettre à jour la propriété Score du quiz
        return totalScore.ToString("0.##") + "/10";

    }


    // POST: api/quiz
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin)]
    [HttpPost("create")]
    public async Task<ActionResult<QuizDTO>> Create(QuizDTO data) {

        var newQuiz = _mapper.Map<Quiz>(data);
        newQuiz.DatabaseId = data.DatabaseId;
        var result = await new QuizValidator(_context).ValidateOnCreate(newQuiz);
        if (!result.IsValid)
            return BadRequest(result);

        _context.Quizzes.Add(newQuiz);
        // Sauve les changements
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = newQuiz.Id }, _mapper.Map<QuizDTO>(newQuiz));
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("name/{name}")]
    public async Task<ActionResult<QuizDTO>> GetByName(string name) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var quiz = await _context.Quizzes.SingleOrDefaultAsync(u => u.Name == name);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (quiz == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<QuizDTO>(quiz);
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin, Role.Student)]
    [HttpGet("database/{name}")]
    public async Task<ActionResult<DatabaseDTO>> GetDatabaseByName(string name) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var database = await _context.Databases
            .Include(d => d.Quizzes)
            .SingleOrDefaultAsync(u => u.Name == name);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (database == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<DatabaseDTO>(database);
    }

    // PUT: api/quiz/id
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, QuizDTO data) {
        // Si l'id est différent du quiz à modifier, on renvoie une erreur 400 Bad Request
        if (id != data.Id)
            return BadRequest();
        // Récupère en BD le quiz à modifier
        var quiz = await _context.Quizzes.FindAsync(id);
        // Si le quiz n'existe pas, on renvoie une erreur 404 Not Found
        if (quiz == null)
            return NotFound();
        // Met à jour le quiz avec les données reçues
        _mapper.Map(data, quiz);
        // Sauve les changements
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/quiz/id
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) {
        // Récupère en BD le quiz à supprimer
        var quiz = await _context.Quizzes.FindAsync(id);
        // Si le quiz n'existe pas, on renvoie une erreur 404 Not Found
        if (quiz == null)
            return NotFound();
        // Indique au contexte EF qu'il faut supprimer ce quiz
        _context.Quizzes.Remove(quiz);
        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Admin)]
    [HttpGet("available/{name}")]
    public async Task<ActionResult<bool>> IsAvailable(string name) {
        return await _context.Quizzes.SingleOrDefaultAsync(q  => q.Name == name) == null;
    }

}
