using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2324_a11.Models;
//using PRID_Framework;
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
public class UsersController : ControllerBase
{ //DTO: pas toutes les donnes sont renvoyée; toutes les propriét sauf mot de passe
    private readonly MsnContext _context;
    private readonly IMapper _mapper;

    /*
    Le contrôleur est instancié automatiquement par ASP.NET Core quand une requête HTTP est reçue.
    Le paramètre du constructeur recoit automatiquement, par injection de dépendance,
    une instance du context EF (MsnContext).
    */
    public UsersController(MsnContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    // GET: api/Users
    [Authorized(Role.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {
        /*
        Remarque: La ligne suivante ne marche pas :
            return _mapper.Map<IEnumerable<MemberDTO>>(await _context.Members.ToListAsync());
        En effet :
            C# doesn't support implicit cast operators on interfaces. Consequently, conversion of the interface to a concrete type is necessary to use ActionResult<T>.
            See: https://docs.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-5.0#actionresultt-type
        */

        // Récupère une liste de tous les membres et utilise le mapper pour les transformer en leur DTO
        return _mapper.Map<List<UserDTO>>(await _context.Users.ToListAsync());
    }

    // GET: api/Members/ben
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDTO>> GetOne(int id) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.FindAsync(id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<UserDTO>(user);
    }


    [HttpPost]
    public async Task<ActionResult<UserDTO>> PostUser(UserWithPasswordDTO user) {
        // Utilise le mapper pour convertir le DTO qu'on a reçu en une instance de Member
        var newUser = _mapper.Map<User>(user);
        // Valide les données
        var result = await new UserValidator(_context).ValidateOnCreate(newUser);
        if (!result.IsValid)
            return BadRequest(result);
        // Ajoute ce nouveau membre au contexte EF
        _context.Users.Add(newUser);
        // Sauve les changements
        await _context.SaveChangesAsync();

        // Renvoie une réponse ayant dans son body les données du nouveau membre (3ème paramètre)
        // et ayant dans ses headers une entrée 'Location' qui contient l'url associé à GetOne avec la bonne valeur
        // pour le paramètre 'pseudo' de cet url.
        return CreatedAtAction(nameof(GetOne), new { id = newUser.Id }, _mapper.Map<UserDTO>(newUser));
    }

    [Authorized(Role.Admin)]
    [HttpPut]
    public async Task<IActionResult> PutUser(UserDTO dto) {
        // Vérifie si le membre à mettre à jour existe bien en BD
        var user = await _context.Users.FindAsync(dto.Id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Mappe les données reçues sur celles du membre en question
        _mapper.Map<UserDTO, User>(dto, user);
        // Valide les données
        var result = await new UserValidator(_context).ValidateAsync(user);
        if (!result.IsValid)
            return BadRequest(result);

        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [Authorized(Role.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        // Récupère en BD le membre à supprimer
        var user = await _context.Users.FindAsync(id);//findAsync que sur la clé primaire
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Indique au contexte EF qu'il faut supprimer ce membre
        _context.Users.Remove(user);
        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [HttpGet("byPseudo/{pseudo}")]
    public async Task<ActionResult<UserDTO>> ByPseudo(string pseudo) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);// singleOrDefault qu'un seul record
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<UserDTO>(user);
    }

    [HttpGet("byEmail/{email}")]
    public async Task<ActionResult<UserDTO>> ByEmail(string email) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<UserDTO>(user);
    }

    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<ActionResult<UserDTO>> Authenticate(UserLoginDTO dto) {
        var user = await Authenticate(dto.Pseudo, dto.Password);

        var result = await new UserValidator(_context).ValidateForAuthenticate(user);
        if (!result.IsValid)
            return BadRequest(result);

        return Ok(_mapper.Map<UserDTO>(user));
    }

    private async Task<User?> Authenticate(string pseudo, string password) {
        //var user = await _context.Users.FindAsync(pseudo); ne fonctionne pas car le find se fait sur la clé primaire qui est un int.

        var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);
        // return null if member not found
        if (user == null)
            return null;

        if (user.Password == password) {
            // authentication successful so generate jwt token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("my-super-secret-key");
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(new Claim[] {
                        new Claim(ClaimTypes.Name, user.Pseudo),
                        new Claim(ClaimTypes.Role, user.Role.ToString())
                    }),
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(1), // validité du token
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);
        }

        return user;
    }


}
