using System.ComponentModel.DataAnnotations;
namespace prid_2324_a11.Models;

public class Database{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; } = "";

    public ICollection<Quiz> Quizzes { get; set; } = new HashSet<Quiz>();
}
