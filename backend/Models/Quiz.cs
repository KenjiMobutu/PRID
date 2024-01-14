using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public enum QuizStatus{
    EnCours = 0,
    Fini = 1,
    PasCommence = 2,
    Cloture = 3,
    NonTest = 4,
    Publie = 5,
    NonPublie = 6,

}

public class Quiz{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; } = "";
    public bool IsPublished { get; set; }
    public bool IsClosed { get; set; }
    public bool IsTest { get; set; }
    public DateTime? Start { get; set; }
    public DateTime? Finish { get; set; }

    [ForeignKey(nameof(DatabaseId))]
    public int DatabaseId { get; set; }
    public Database Database { get; set; } = null!;
    public virtual ICollection<Question> Questions { get; set; } = new HashSet<Question>();
    public virtual ICollection<Attempt> Attempts { get; set; } = new HashSet<Attempt>();

}
