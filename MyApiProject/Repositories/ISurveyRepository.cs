using MyApiProject.Models;

namespace MyApiProject.Repositories;

public interface ISurveyRepository
{
    Task<List<Survey>> GetAllAsync();
    Task<Survey?> GetByIdAsync(Guid id);
    Task AddAsync(Survey survey);
    Task UpdateAsync(Survey survey);
    Task DeleteAsync(Guid id);
    Task AddResponseAsync(Guid surveyId, SurveyResponse response);
}
