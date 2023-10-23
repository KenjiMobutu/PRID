using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2324_a11.Models;

public class UserDTO
{
    public int Id { get; set; }
    public string Pseudo { get; set; } = "";
    public string Email { get; set; } = "";//null!
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateTime? BirthDate { get; set; }
    public Role Role { get; set; }
    public string? Token { get; set; }


}


public class UserWithPasswordDTO : UserDTO
{
    public string Password { get; set; } = "";
}
