using MyApiProject.Models;

namespace MyApiProject.Repositories;

public interface IUserRepository
{
    Task AddAsync(UserEntity user, CancellationToken cancellationToken = default);
    Task<List<UserEntity>> GetAllAsync(CancellationToken cancellationToken = default);
}
