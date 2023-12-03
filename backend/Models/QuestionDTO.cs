using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class QuestionDTO{
    public int Id { get; set; }
    public int Order { get; set; }
    public string Body { get; set; } = null!;


    public ICollection<SolutionDTO> SolutionsDTO { get; set; } = new HashSet<SolutionDTO>();
    public ICollection<AnswerDTO> AnswersDTO { get; set; } = new HashSet<AnswerDTO>();
}
