using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace prid_2324_a11.Models;

public class DatabaseDTO{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; } = "";

    public ICollection<QuizDTO> QuizzesDTO { get; set; } = new HashSet<QuizDTO>();
}
