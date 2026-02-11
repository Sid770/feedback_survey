using MyApiProject.Models;

namespace MyApiProject.Data;

public class InMemoryDataStore
{
    private readonly List<Survey> _surveys = new();
    private readonly object _lock = new();

    public InMemoryDataStore()
    {
        Seed();
    }

    public List<Survey> Surveys => _surveys;
    public object SyncRoot => _lock;

    private void Seed()
    {
        if (_surveys.Any())
        {
            return;
        }

        var survey = new Survey
        {
            Title = "Campus Facilities Feedback",
            Description = "Collects anonymous feedback about campus facilities",
            CreatedBy = "admin",
            Status = SurveyStatus.Published
        };

        var q1 = new Question
        {
            SurveyId = survey.Id,
            Text = "How would you rate the library facilities?",
            Type = QuestionType.SingleChoice,
        };

        q1.Options.AddRange(new[]
        {
            new OptionChoice { QuestionId = q1.Id, Text = "Excellent" },
            new OptionChoice { QuestionId = q1.Id, Text = "Good" },
            new OptionChoice { QuestionId = q1.Id, Text = "Average" },
            new OptionChoice { QuestionId = q1.Id, Text = "Poor" }
        });

        var q2 = new Question
        {
            SurveyId = survey.Id,
            Text = "Any suggestions to improve facilities?",
            Type = QuestionType.Text
        };

        survey.Questions.AddRange(new[] { q1, q2 });
        _surveys.Add(survey);
    }
}
