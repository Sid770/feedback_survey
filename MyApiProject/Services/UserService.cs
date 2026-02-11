using MyApiProject.DTOs;
using MyApiProject.Models;
using MyApiProject.Repositories;

namespace MyApiProject.Services;

public class UserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task AddAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException("Name is required");
        }
        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            throw new ArgumentException("Email is required");
        }

        var entity = new UserEntity
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
        };

        await _repository.AddAsync(entity, cancellationToken);
    }

    public async Task<List<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities
            .OrderByDescending(e => e.Timestamp)
            .Select(e => new UserDto
            {
                Id = e.RowKey,
                Name = e.Name,
                Email = e.Email,
            })
            .ToList();
    }
}
