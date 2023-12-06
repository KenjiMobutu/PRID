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
public class AnswerController : ControllerBase{

  private readonly PridContext _context;
  private readonly IMapper _mapper;
  private readonly TokenHelper _tokenHelper;

  public AnswerController(PridContext context, IMapper mapper) {
    _context = context;
    _mapper = mapper;
    _tokenHelper = new TokenHelper(context);
  }
  


}
