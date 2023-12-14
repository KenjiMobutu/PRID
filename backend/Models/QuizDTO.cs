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
    public DatabaseDTO Database { get; set; } = null!;

    public QuizStatus Status{
        get {
            DateTime now = DateTime.Now;
            if (IsTest){
                if (now > Finish){
                    return QuizStatus.Cloture;
                }else if ( now >= Start && now <= Finish && Attempts.Count > 0){
                    return QuizStatus.Fini;
                }
                else if(now >= Start && now <= Finish && Attempts.Count == 0){
                    return QuizStatus.PasCommence;
                }else if (now >= Start && now <= Finish && Attempts.Count == 0){
                    return QuizStatus.PasCommence;
                }else{
                    return QuizStatus.NonTest; // Retourne une valeur par défaut
                }
            }else{
                if (now < Finish){
                    Console.WriteLine("QuizStatus.Cloture");
                    return QuizStatus.Cloture;
                }
                else if (Attempts.Count == 0){
                    return QuizStatus.PasCommence;
                }
                else if (Attempts.Count > 0){
                    return QuizStatus.EnCours;
                }
                else{
                    return QuizStatus.Fini;
                }
            }
        }
    }

    public ICollection<QuestionDTO> Questions { get; set; } = new HashSet<QuestionDTO>();
    public ICollection<AttemptDTO> Attempts { get; set; } = new HashSet<AttemptDTO>();
}
