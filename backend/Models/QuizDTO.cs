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
    public DateTime? Start { get; set; }
    public DateTime? Finish { get; set; }

    [ForeignKey(nameof(DatabaseId))]
    public int DatabaseId { get; set; }
    //public DatabaseDTO Database { get; set; } = null!;

    public bool HaveAttempt { get; set; }
    public string? Score { get; set; }

    private QuizStatus _externalStatus;
    private bool _isExternalStatusSet = false;

    public void SetExternalStatus(QuizStatus status){
        _externalStatus = status;
        _isExternalStatusSet = true;
    }

    public QuizStatus Status{
        get{
            if (_isExternalStatusSet)
                return _externalStatus;
            DateTime now = DateTime.Now;
            return (IsPublished, Finish) switch{
                (false, _) => QuizStatus.NonPublie,
                (true, null) => QuizStatus.Publie, // Si Finish est null et IsPublished est true
                (true, _) when now > Finish => QuizStatus.Cloture, // Si Finish n'est pas null et la date actuelle est après Finish
                _ => QuizStatus.Publie // Cas par défaut
            };
        }
    }

    public ICollection<QuestionDTO> Questions { get; set; } = new HashSet<QuestionDTO>();
    public ICollection<AttemptDTO> Attempts { get; set; } = new HashSet<AttemptDTO>();
}
