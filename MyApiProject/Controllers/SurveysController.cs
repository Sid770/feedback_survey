using Microsoft.AspNetCore.Mvc;
using MyApiProject.DTOs;
using MyApiProject.Services;

namespace MyApiProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SurveysController : ControllerBase
{
    private readonly ISurveyService _service;

    public SurveysController(ISurveyService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<SurveySummaryDto>>> Get()
    {
        var surveys = await _service.GetAllAsync();
        return Ok(surveys);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SurveyDetailDto>> Get(Guid id)
    {
        var survey = await _service.GetByIdAsync(id);
        return survey is null ? NotFound() : Ok(survey);
    }

    [HttpPost]
    public async Task<ActionResult<SurveyDetailDto>> Create(SurveyCreateDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SurveyDetailDto>> Update(Guid id, SurveyUpdateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> Publish(Guid id)
    {
        await _service.PublishAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        await _service.CloseAsync(id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/responses")]
    public async Task<IActionResult> SubmitResponse(Guid id, SurveyResponseCreateDto dto)
    {
        await _service.SubmitResponseAsync(id, dto);
        return Accepted();
    }

    [HttpGet("{id}/analytics")]
    public async Task<ActionResult<SurveyAnalyticsDto>> Analytics(Guid id)
    {
        var analytics = await _service.GetAnalyticsAsync(id);
        return analytics is null ? NotFound() : Ok(analytics);
    }
}
