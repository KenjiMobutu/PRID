namespace prid_tuto.Models;

public class UserDTO{
    public int Id { get; set; }
    public string Pseudo { get; set; } = "";
    public string Email { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateTime? BirthDate { get; set; }
}

public class UserWithPasswordDTO : UserDTO{
    public string Password { get; set; } = "";
}
