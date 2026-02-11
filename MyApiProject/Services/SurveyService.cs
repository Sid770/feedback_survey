using MyApiProject.DTOs;
using MyApiProject.Models;
using MyApiProject.Repositories;

namespace MyApiProject.Services;

public class SurveyService : ISurveyService
{
    private readonly ISurveyRepository _repository;
    private readonly ILogger<SurveyService> _logger;

    public SurveyService(ISurveyRepository repository, ILogger<SurveyService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<SurveySummaryDto>> GetAllAsync()
    {
        var surveys = await _repository.GetAllAsync();
        return surveys.Select(MapToSummary).ToList();
    }

    public async Task<SurveyDetailDto?> GetByIdAsync(Guid id)
    {
        var survey = await _repository.GetByIdAsync(id);
        return survey is null ? null : MapToDetail(survey);
    }

    public async Task<SurveyDetailDto> CreateAsync(SurveyCreateDto dto)
    {
        ValidateSurveyDto(dto.Title, dto.Description, dto.Questions);

        var survey = new Survey
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            CreatedBy = dto.CreatedBy.Trim(),
            Status = SurveyStatus.Draft,
            CreatedAtUtc = DateTime.UtcNow,
            Questions = dto.Questions.Select(q => MapToQuestion(q, Guid.Empty)).ToList()
        };

        foreach (var question in survey.Questions)
        {
            question.SurveyId = survey.Id;
            foreach (var option in question.Options)
            {
                option.QuestionId = question.Id;
            }
        }

        await _repository.AddAsync(survey);
        _logger.LogInformation("Survey {SurveyId} created", survey.Id);
        return MapToDetail(survey);
    }

    public async Task<SurveyDetailDto> UpdateAsync(Guid id, SurveyUpdateDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Survey not found");
        if (existing.Status != SurveyStatus.Draft)
        {
            throw new InvalidOperationException("Only draft surveys can be updated");
        }

        ValidateSurveyDto(dto.Title, dto.Description, dto.Questions);

        existing.Title = dto.Title.Trim();
        existing.Description = dto.Description.Trim();
        existing.Questions = dto.Questions.Select(q => MapToQuestion(q, existing.Id)).ToList();

        await _repository.UpdateAsync(existing);
        _logger.LogInformation("Survey {SurveyId} updated", id);
        return MapToDetail(existing);
    }

    public async Task PublishAsync(Guid id)
    {
        var survey = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Survey not found");
        if (survey.Status != SurveyStatus.Draft)
        {
            throw new InvalidOperationException("Only draft surveys can be published");
        }

        survey.Status = SurveyStatus.Published;
        await _repository.UpdateAsync(survey);
        _logger.LogInformation("Survey {SurveyId} published", id);
    }

    public async Task CloseAsync(Guid id)
    {
        var survey = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Survey not found");
        if (survey.Status != SurveyStatus.Published)
        {
            throw new InvalidOperationException("Only published surveys can be closed");
        }

        survey.Status = SurveyStatus.Closed;
        await _repository.UpdateAsync(survey);
        _logger.LogInformation("Survey {SurveyId} closed", id);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _repository.DeleteAsync(id);
        _logger.LogInformation("Survey {SurveyId} deleted", id);
    }

    public async Task SubmitResponseAsync(Guid surveyId, SurveyResponseCreateDto dto)
    {
        var survey = await _repository.GetByIdAsync(surveyId) ?? throw new KeyNotFoundException("Survey not found");
        if (survey.Status != SurveyStatus.Published)
        {
            throw new InvalidOperationException("Responses are only accepted for published surveys");
        }

        var response = new SurveyResponse
        {
            SurveyId = surveyId,
            SubmittedAtUtc = DateTime.UtcNow
        };

        foreach (var answerDto in dto.Answers)
        {
            var question = survey.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question is null)
            {
                throw new ArgumentException("Question not found in survey");
            }

            if (question.Type == QuestionType.SingleChoice)
            {
                if (!answerDto.SelectedOptionId.HasValue)
                {
                    throw new ArgumentException("SelectedOptionId is required for single choice questions");
                }
                var optionExists = question.Options.Any(o => o.Id == answerDto.SelectedOptionId.Value);
                if (!optionExists)
                {
                    throw new ArgumentException("Selected option is invalid for the question");
                }
            }
            else if (question.Type == QuestionType.Text)
            {
                if (string.IsNullOrWhiteSpace(answerDto.TextAnswer))
                {
                    throw new ArgumentException("TextAnswer is required for text questions");
                }
            }

            response.Answers.Add(new ResponseItem
            {
                QuestionId = answerDto.QuestionId,
                SelectedOptionId = answerDto.SelectedOptionId,
                TextAnswer = answerDto.TextAnswer?.Trim()
            });
        }

        await _repository.AddResponseAsync(surveyId, response);
        _logger.LogInformation("Response added to survey {SurveyId}", surveyId);
    }

    public async Task<SurveyAnalyticsDto?> GetAnalyticsAsync(Guid surveyId)
    {
        var survey = await _repository.GetByIdAsync(surveyId);
        if (survey is null)
        {
            return null;
        }

        var dto = new SurveyAnalyticsDto
        {
            SurveyId = survey.Id,
            Title = survey.Title,
            TotalResponses = survey.Responses.Count,
            Questions = new List<QuestionAnalyticsDto>()
        };

        foreach (var question in survey.Questions)
        {
            var questionAnalytics = new QuestionAnalyticsDto
            {
                QuestionId = question.Id,
                Text = question.Text,
                Type = question.Type,
                ResponseCount = survey.Responses.Count(r => r.Answers.Any(a => a.QuestionId == question.Id)),
                Options = new List<OptionAnalyticsDto>()
            };

            if (question.Type == QuestionType.SingleChoice)
            {
                foreach (var option in question.Options)
                {
                    var count = survey.Responses
                        .SelectMany(r => r.Answers)
                        .Count(a => a.QuestionId == question.Id && a.SelectedOptionId == option.Id);

                    questionAnalytics.Options.Add(new OptionAnalyticsDto
                    {
                        OptionId = option.Id,
                        Text = option.Text,
                        Count = count
                    });
                }
            }

            dto.Questions.Add(questionAnalytics);
        }

        return dto;
    }

    private static void ValidateSurveyDto(string title, string description, List<QuestionCreateDto> questions)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Title is required");
        }

        if (questions is null || questions.Count == 0)
        {
            throw new ArgumentException("At least one question is required");
        }

        foreach (var question in questions)
        {
            if (string.IsNullOrWhiteSpace(question.Text))
            {
                throw new ArgumentException("Question text is required");
            }

            if (question.Type == QuestionType.SingleChoice)
            {
                if (question.Options is null || question.Options.Count == 0)
                {
                    throw new ArgumentException("Single choice questions require options");
                }

                if (question.Options.Any(o => string.IsNullOrWhiteSpace(o.Text)))
                {
                    throw new ArgumentException("Option text cannot be empty");
                }
            }
        }
    }

    private static Question MapToQuestion(QuestionCreateDto dto, Guid surveyId)
    {
        var question = new Question
        {
            SurveyId = surveyId,
            Text = dto.Text.Trim(),
            Type = dto.Type,
            Options = new List<OptionChoice>()
        };

        if (dto.Type == QuestionType.SingleChoice)
        {
            question.Options = dto.Options.Select(o => new OptionChoice
            {
                Id = o.Id ?? Guid.NewGuid(),
                QuestionId = question.Id,
                Text = o.Text.Trim()
            }).ToList();
        }

        return question;
    }

    private static SurveySummaryDto MapToSummary(Survey survey)
    {
        return new SurveySummaryDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            Status = survey.Status,
            CreatedAtUtc = survey.CreatedAtUtc
        };
    }

    private static SurveyDetailDto MapToDetail(Survey survey)
    {
        return new SurveyDetailDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            Status = survey.Status,
            CreatedAtUtc = survey.CreatedAtUtc,
            Questions = survey.Questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Text = q.Text,
                Type = q.Type,
                Options = q.Options.Select(o => new OptionChoiceDto
                {
                    Id = o.Id,
                    Text = o.Text
                }).ToList()
            }).ToList(),
            ResponseCount = survey.Responses.Count
        };
    }
}
