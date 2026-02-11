using MyApiProject.Models;

namespace MyApiProject.DTOs;

public class OptionChoiceDto
{
    public Guid? Id { get; set; }
    public string Text { get; set; } = string.Empty;
}

public class QuestionCreateDto
{
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; } = QuestionType.SingleChoice;
    public List<OptionChoiceDto> Options { get; set; } = new();
}

public class SurveyCreateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = "admin";
    public List<QuestionCreateDto> Questions { get; set; } = new();
}

public class SurveyUpdateDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<QuestionCreateDto> Questions { get; set; } = new();
}

public class ResponseItemCreateDto
{
    public Guid QuestionId { get; set; }
    public string? TextAnswer { get; set; }
    public Guid? SelectedOptionId { get; set; }
}

public class SurveyResponseCreateDto
{
    public List<ResponseItemCreateDto> Answers { get; set; } = new();
}

public class SurveySummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SurveyStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class QuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public List<OptionChoiceDto> Options { get; set; } = new();
}

public class SurveyDetailDto : SurveySummaryDto
{
    public List<QuestionDto> Questions { get; set; } = new();
    public int ResponseCount { get; set; }
}

public class OptionAnalyticsDto
{
    public Guid OptionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class QuestionAnalyticsDto
{
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public int ResponseCount { get; set; }
    public List<OptionAnalyticsDto> Options { get; set; } = new();
}

public class SurveyAnalyticsDto
{
    public Guid SurveyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int TotalResponses { get; set; }
    public List<QuestionAnalyticsDto> Questions { get; set; } = new();
}
