using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_tuto.Models;

namespace prid_tuto.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
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
        return CreatedAtAction(nameof(GetOne), new { id = user.Id }, _mapper.Map<UserDTO>(newUser));
    }

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        // Récupère en BD le membre à supprimer
        var user = await _context.Users.FindAsync(id);
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
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Pseudo == pseudo);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<UserDTO>(user);
    }

    [HttpGet("byEmail/{email}")]
    public async Task<ActionResult<UserDTO>> ByEmail(string email) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Retourne le membre
        return _mapper.Map<UserDTO>(user);
    }

}
