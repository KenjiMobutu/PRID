using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class AttemptDTO{
    public int Id { get; set; }
    public DateTime Start { get; set; }
    public DateTime Finish { get; set; }

    [ForeignKey(nameof(StudentId))]
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    [ForeignKey(nameof(QuizDTOId))]
    public int QuizDTOId { get; set; }
    public Quiz QuizDTO { get; set; } = null!;

    public ICollection<AnswerDTO> AnswersDTO { get; set; } = new HashSet<AnswerDTO>();
}