using MyApiProject.DTOs;
using MyApiProject.Models;

namespace MyApiProject.Services;

public interface ISurveyService
{
    Task<List<SurveySummaryDto>> GetAllAsync();
    Task<SurveyDetailDto?> GetByIdAsync(Guid id);
    Task<SurveyDetailDto> CreateAsync(SurveyCreateDto dto);
    Task<SurveyDetailDto> UpdateAsync(Guid id, SurveyUpdateDto dto);
    Task PublishAsync(Guid id);
    Task CloseAsync(Guid id);
    Task DeleteAsync(Guid id);
    Task SubmitResponseAsync(Guid surveyId, SurveyResponseCreateDto dto);
    Task<SurveyAnalyticsDto?> GetAnalyticsAsync(Guid surveyId);
}
