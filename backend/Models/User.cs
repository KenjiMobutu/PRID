using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public enum Role
{
    Admin = 2, Teacher = 1, Student = 0
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
    public Role Role { get; set; } = Role.Student;

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

    public string? RefreshToken { get; set; }


    public ICollection<Attempt> Attempts { get; set; } = new HashSet<Attempt>();

}

public class Admin : User{
    public Admin() : base() {
        Role = Role.Admin;
    }

}

public class Teacher : User{
    public Teacher() : base() {
        Role = Role.Teacher;
    }
}

public class Student : User{
    public Student() : base() {
        Role = Role.Student;
    }

}
