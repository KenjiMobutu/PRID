using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class Question{
    [Key]
    public int Id { get; set; }
    public int Order { get; set; }
    public string Body { get; set; } = "";

    [ForeignKey(nameof(QuizId))]
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public ICollection<Solution> Solutions { get; set; } = new HashSet<Solution>();
    public ICollection<Answer> Answers { get; set; } = new HashSet<Answer>();
}
