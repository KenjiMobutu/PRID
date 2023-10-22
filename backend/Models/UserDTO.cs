namespace prid_tuto.Models;

public class UserDTO
{
    public int Id { get; set; }
    public string Pseudo { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateTime? BirthDate { get; set; }
}

public class UserWithPasswordDTO : UserDTO
{
    public string Password { get; set; } = "";
}
