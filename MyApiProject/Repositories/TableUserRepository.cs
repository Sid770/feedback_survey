using Azure.Data.Tables;
using MyApiProject.Models;

namespace MyApiProject.Repositories;

public class TableUserRepository : IUserRepository
{
    private readonly TableClient _table;
    private const string Partition = "USER";

    public TableUserRepository(TableServiceClient tableServiceClient)
    {
        _table = tableServiceClient.GetTableClient("Users");
        _table.CreateIfNotExists();
    }

    public async Task AddAsync(UserEntity user, CancellationToken cancellationToken = default)
    {
        user.PartitionKey = Partition;
        user.RowKey = string.IsNullOrWhiteSpace(user.RowKey) ? Guid.NewGuid().ToString() : user.RowKey;
        await _table.AddEntityAsync(user, cancellationToken);
    }

    public async Task<List<UserEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var results = new List<UserEntity>();
        var query = _table.QueryAsync<UserEntity>(x => x.PartitionKey == Partition, cancellationToken: cancellationToken);
        await foreach (var entity in query)
        {
            results.Add(entity);
        }
        return results;
    }
}
