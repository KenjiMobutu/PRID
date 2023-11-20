using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class Solution{
    [Key]
    public int Id { get; set; }
    public int Order { get; set; }
    public string Sql { get; set; } = "";

    [ForeignKey(nameof(QuestionId))]
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}
