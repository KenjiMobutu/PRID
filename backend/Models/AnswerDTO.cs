using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;


public class AnswerDTO{
    public int Id { get; set; }
    public string Sql { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public bool IsCorrect { get; set; }
    public int QuestionId { get; set; }
    public int AttemptId { get; set; }

}
