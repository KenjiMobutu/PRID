namespace prid_2324_a11.Models;

public class CalculateQuizScoreModel{
    public QuizDTO Quiz { get; set; } = new QuizDTO();
    public Attempt Attempt { get; set; } = new Attempt();
}
