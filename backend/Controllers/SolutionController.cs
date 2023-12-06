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

}
