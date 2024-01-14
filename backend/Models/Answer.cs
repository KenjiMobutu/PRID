using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;


public class Answer{
    [Key]
    public int Id { get; set; }
    public string Sql { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public bool IsCorrect { get; set; }

    [ForeignKey(nameof(AttemptId))]
    public int AttemptId { get; set; }
    public Attempt Attempt { get; set; } = null!;

    [ForeignKey(nameof(QuestionId))]
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;

}
