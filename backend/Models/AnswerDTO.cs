using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;


public class AnswerDTO{
    public int Id { get; set; }
    public string Sql { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public bool IsCorrect { get; set; }

    // [ForeignKey(nameof(AttemptDTOId))]
    // public int AttemptDTOId { get; set; }
    // public AttemptDTO AttemptDTO { get; set; } = null!;

    // [ForeignKey(nameof(QuestionDTOId))]
    // public int QuestionDTOId { get; set; }
    // public QuestionDTO QuestionDTO { get; set; } = null!;


}
