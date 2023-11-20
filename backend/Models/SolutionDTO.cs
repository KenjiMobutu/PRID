using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class SolutionDTO{
    public int Id { get; set; }
    public int Order { get; set; }
    public string Sql { get; set; } = "";

    [ForeignKey(nameof(QuestionDTOId))]
    public int QuestionDTOId { get; set; }
    public QuestionDTO QuestionDTO { get; set; } = null!;
}
