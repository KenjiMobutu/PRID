using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public enum QuizStatus{
    EnCours = 0,
    Fini = 1,
    PasCommence = 2,
    Cloture = 3,
    NonTest = 4
}

public class Quiz{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; } = "";
    public bool IsPublished { get; set; }
    public bool IsClosed { get; set; }
    public bool IsTest { get; set; }
    public DateTime Start { get; set; }
    public DateTime Finish { get; set; }

    [ForeignKey(nameof(DatabaseId))]
    public int DatabaseId { get; set; }
    public Database Database { get; set; } = null!;

    // public QuizStatus Status{
    //     get{
    //         DateTime now = DateTime.Now;
    //         if (IsTest){
    //             if (now > Finish){
    //                 return QuizStatus.Cloture;
    //             }
    //             else{
    //                 return QuizStatus.EnCours;
    //             }
    //         }
    //         else{
    //             if (now < Finish){
    //                 Console.WriteLine("QuizStatus.Cloture");
    //                 return QuizStatus.Cloture;
    //             }
    //             else if (now < Start){
    //                 return QuizStatus.PasCommence;
    //             }
    //             else if (now >= Start && now <= Finish){
    //                 return QuizStatus.EnCours;
    //             }
    //             else{
    //                 return QuizStatus.Fini;
    //             }
    //         }
    //     }
    // }

    public virtual ICollection<Question> Questions { get; set; } = new HashSet<Question>();
    public virtual ICollection<Attempt> Attempts { get; set; } = new HashSet<Attempt>();

}
