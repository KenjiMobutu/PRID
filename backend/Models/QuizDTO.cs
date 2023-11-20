using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class QuizDTO{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; } = "";
    public bool IsPublished { get; set; }
    public bool IsClosed { get; set; }
    public bool IsTest { get; set; }
    public DateTime Start { get; set; }
    public DateTime Finish { get; set; }

    [ForeignKey(nameof(DatabaseDTOId))]
    public int DatabaseDTOId { get; set; }
    public virtual DatabaseDTO Database { get; set; } = null!;

    public ICollection<QuestionDTO> QuestionsDTO { get; set; } = new HashSet<QuestionDTO>();
    public ICollection<AttemptDTO> AttemptsDTO { get; set; } = new HashSet<AttemptDTO>();
}
