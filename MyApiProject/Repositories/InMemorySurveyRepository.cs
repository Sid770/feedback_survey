using MyApiProject.Data;
using MyApiProject.Models;

namespace MyApiProject.Repositories;

public class InMemorySurveyRepository : ISurveyRepository
{
    private readonly InMemoryDataStore _store;

    public InMemorySurveyRepository(InMemoryDataStore store)
    {
        _store = store;
    }

    public Task<List<Survey>> GetAllAsync()
    {
        lock (_store.SyncRoot)
        {
            return Task.FromResult(_store.Surveys.Select(CloneSurvey).ToList());
        }
    }

    public Task<Survey?> GetByIdAsync(Guid id)
    {
        lock (_store.SyncRoot)
        {
            var survey = _store.Surveys.FirstOrDefault(s => s.Id == id);
            return Task.FromResult(survey is null ? null : CloneSurvey(survey));
        }
    }

    public Task AddAsync(Survey survey)
    {
        lock (_store.SyncRoot)
        {
            _store.Surveys.Add(CloneSurvey(survey));
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Survey survey)
    {
        lock (_store.SyncRoot)
        {
            var existing = _store.Surveys.FirstOrDefault(s => s.Id == survey.Id);
            if (existing is null)
            {
                throw new KeyNotFoundException("Survey not found");
            }

            existing.Title = survey.Title;
            existing.Description = survey.Description;
            existing.Status = survey.Status;
            existing.CreatedBy = survey.CreatedBy;
            existing.CreatedAtUtc = survey.CreatedAtUtc;
            existing.Questions = survey.Questions.Select(CloneQuestion).ToList();
            existing.Responses = survey.Responses.Select(CloneResponse).ToList();
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid id)
    {
        lock (_store.SyncRoot)
        {
            var existing = _store.Surveys.FirstOrDefault(s => s.Id == id);
            if (existing is not null)
            {
                _store.Surveys.Remove(existing);
            }
        }
        return Task.CompletedTask;
    }

    public Task AddResponseAsync(Guid surveyId, SurveyResponse response)
    {
        lock (_store.SyncRoot)
        {
            var existing = _store.Surveys.FirstOrDefault(s => s.Id == surveyId);
            if (existing is null)
            {
                throw new KeyNotFoundException("Survey not found");
            }

            existing.Responses.Add(CloneResponse(response));
        }

        return Task.CompletedTask;
    }

    private static Survey CloneSurvey(Survey survey)
    {
        return new Survey
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            Status = survey.Status,
            CreatedAtUtc = survey.CreatedAtUtc,
            CreatedBy = survey.CreatedBy,
            Questions = survey.Questions.Select(CloneQuestion).ToList(),
            Responses = survey.Responses.Select(CloneResponse).ToList()
        };
    }

    private static Question CloneQuestion(Question question)
    {
        return new Question
        {
            Id = question.Id,
            SurveyId = question.SurveyId,
            Text = question.Text,
            Type = question.Type,
            Options = question.Options.Select(CloneOption).ToList()
        };
    }

    private static OptionChoice CloneOption(OptionChoice option)
    {
        return new OptionChoice
        {
            Id = option.Id,
            QuestionId = option.QuestionId,
            Text = option.Text
        };
    }

    private static SurveyResponse CloneResponse(SurveyResponse response)
    {
        return new SurveyResponse
        {
            Id = response.Id,
            SurveyId = response.SurveyId,
            SubmittedAtUtc = response.SubmittedAtUtc,
            Answers = response.Answers.Select(CloneAnswer).ToList()
        };
    }

    private static ResponseItem CloneAnswer(ResponseItem item)
    {
        return new ResponseItem
        {
            Id = item.Id,
            QuestionId = item.QuestionId,
            TextAnswer = item.TextAnswer,
            SelectedOptionId = item.SelectedOptionId
        };
    }
}
