using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class Attempt{
    [Key]
    public int Id { get; set; }
    public DateTime? Start { get; set; }
    public DateTime? Finish { get; set; }

    [ForeignKey(nameof(StudentId))]
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    [ForeignKey(nameof(QuizId))]
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public ICollection<Answer> Answers { get; set; } = new HashSet<Answer>();
}
