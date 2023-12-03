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
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAll() {
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions.ToListAsync());
    }

    // GET: api/Question/id
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionDTO>> GetOne(int id) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var question = await _context.Questions.FindAsync(id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (question == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<QuestionDTO>(question);
    }
}
