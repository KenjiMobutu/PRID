using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using prid_2324_a11.Models;

namespace prid_2324_a11.Helpers;

public class TokenHelper{
    private PridContext _context;
    public TokenHelper(PridContext context) {
        this._context = context;
    }

    public static string GenerateJwtToken(string pseudo, Role role) {
        var claims = new Claim[]
                {
                        new Claim(ClaimTypes.Name, pseudo),
                        new Claim(ClaimTypes.Role, role.ToString())
                };
        return GenerateJwtToken(claims);
    }

    public static string GenerateJwtToken(IEnumerable<Claim> claims) {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("my-super-secret-key");
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(claims),
            IssuedAt = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public static string GenerateRefreshToken() {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create()) {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    public static ClaimsPrincipal GetPrincipalFromExpiredToken(string token) {
        var tokenValidationParameters = new TokenValidationParameters {
            ValidateAudience = false, //you might want to validate the audience and issuer depending on your use case
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("my-super-secret-key")),
            ValidateLifetime = false //here we are saying that we don't care about the token's expiration date
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken securityToken;
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
        var jwtSecurityToken = securityToken as JwtSecurityToken;
        if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            throw new SecurityTokenException("Invalid token");

        return principal;
    }

    public async Task<string?> GetRefreshTokenAsync(string pseudo) {
        var user = await _context.Users.FindAsync(pseudo);
        return user?.RefreshToken;
    }

    public async Task SaveRefreshTokenAsync(string pseudo, string token) {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);;
        if (user != null) {
            Console.WriteLine("**** REFRESH TOKEN user --->: " + user.Pseudo);
            user.RefreshToken = token;
            await _context.SaveChangesAsync();
        }
    }

    public static string GetPasswordHash(string password) {
        string salt = "Peodks;zsOK30S,s";
        // derive a 256-bit subkey (use HMACSHA1 with 10,000 iterations)
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.UTF8.GetBytes(salt),
            prf: KeyDerivationPrf.HMACSHA1,
            iterationCount: 10000,
            numBytesRequested: 256 / 8));
        return hashed;
    }
}
