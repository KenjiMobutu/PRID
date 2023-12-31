using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class QuestionDTO{
    public int Id { get; set; }
    public int Order { get; set; }
    public string Body { get; set; } = null!;

    [ForeignKey(nameof(QuizId))]
    public int QuizId { get; set; }

    public ICollection<SolutionDTO> Solutions { get; set; } = new HashSet<SolutionDTO>();
    public ICollection<AnswerDTO> Answers { get; set; } = new HashSet<AnswerDTO>();
}
