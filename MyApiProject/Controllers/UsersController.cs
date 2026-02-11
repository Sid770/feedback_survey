using Microsoft.AspNetCore.Mvc;
using MyApiProject.DTOs;
using MyApiProject.Services;

namespace MyApiProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserService _service;

    public UsersController(UserService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto, CancellationToken cancellationToken)
    {
        await _service.AddAsync(dto, cancellationToken);
        return Created(string.Empty, null);
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await _service.GetAllAsync(cancellationToken);
        return Ok(users);
    }
}
