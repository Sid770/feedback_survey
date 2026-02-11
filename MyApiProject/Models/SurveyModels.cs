namespace MyApiProject.Models;

public enum SurveyStatus
{
    Draft = 0,
    Published = 1,
    Closed = 2
}

public enum QuestionType
{
    SingleChoice = 0,
    Text = 1
}

public class Survey
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SurveyStatus Status { get; set; } = SurveyStatus.Draft;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = "admin";
    public List<Question> Questions { get; set; } = new();
    public List<SurveyResponse> Responses { get; set; } = new();
}

public class Question
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SurveyId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; } = QuestionType.SingleChoice;
    public List<OptionChoice> Options { get; set; } = new();
}

public class OptionChoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class SurveyResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SurveyId { get; set; }
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public List<ResponseItem> Answers { get; set; } = new();
}

public class ResponseItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuestionId { get; set; }
    public string? TextAnswer { get; set; }
    public Guid? SelectedOptionId { get; set; }
}
