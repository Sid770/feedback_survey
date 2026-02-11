using Microsoft.OpenApi.Models;
using Azure.Data.Tables;
using MyApiProject.Data;
using MyApiProject.Middleware;
using MyApiProject.Repositories;
using MyApiProject.Services;

var builder = WebApplication.CreateBuilder(args);

// configuration: prefer environment variable STORAGECONNECTION over appsettings
var storageConnection = Environment.GetEnvironmentVariable("StorageConnection")
    ?? builder.Configuration.GetValue<string>("StorageConnection")
    ?? "UseDevelopmentStorage=true";

builder.Services.AddSingleton(new TableServiceClient(storageConnection));

builder.Services.AddSingleton<InMemoryDataStore>();
builder.Services.AddScoped<ISurveyRepository, InMemorySurveyRepository>();
builder.Services.AddScoped<ISurveyService, SurveyService>();
builder.Services.AddScoped<IUserRepository, TableUserRepository>();
builder.Services.AddScoped<UserService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Student Feedback & Survey API",
        Version = "v1",
        Description = "API for managing surveys and collecting anonymous feedback"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
    });
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
