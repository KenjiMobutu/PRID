using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2324_a11.Models;

public class UserDTO{
    public int Id { get; set; }
    public string Pseudo { get; set; } = null!;
    public string Email { get; set; } = ""; //null!
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateTime? BirthDate { get; set; }
    public Role Role { get; set; } = Role.Student;
    public string? Token { get; set; }


    public ICollection<AttemptDTO> AttemptsDTO { get; set; } = new HashSet<AttemptDTO>();
}

public class UserWithPasswordDTO : UserDTO{
    public string Password { get; set; } = "";
}

public class UserLoginDTO : UserWithPasswordDTO{
    public string Pseudo{ get; set; } = null!;
    public string Password { get; set; } = null!;
}
