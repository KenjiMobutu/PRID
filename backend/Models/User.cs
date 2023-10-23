using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public enum Role
{
    Admin = 2, Manager = 1, User = 0
}

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Pseudo { get; set; } = "";
    public string Password { get; set; } = "";
    public string Email { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateTime? BirthDate { get; set; }
    public Role Role { get; set; } = Role.User;

    [NotMapped]
    public string? Token { get; set; }

    public int? Age {
        get {
            if (!BirthDate.HasValue)
                return null;
            var today = DateTime.Today;
            var age = today.Year - BirthDate.Value.Year;
            if (BirthDate.Value.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}
