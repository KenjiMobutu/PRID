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
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes.ToListAsync());
    }
}
