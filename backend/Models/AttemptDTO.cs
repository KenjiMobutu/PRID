using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class AttemptDTO{
    public int Id { get; set; }
    public DateTime? Start { get; set; }
    public DateTime? Finish { get; set; }

    [ForeignKey(nameof(StudentId))]
    public int StudentId { get; set; }

    [ForeignKey(nameof(QuizId))]
    public int QuizId { get; set; }

    public ICollection<AnswerDTO> Answers { get; set; } = new HashSet<AnswerDTO>();
}
