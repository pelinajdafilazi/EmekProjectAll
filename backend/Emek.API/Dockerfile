# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Emek.API/Emek.API.csproj", "Emek.API/"]
COPY ["Emek.Application/Emek.Application.csproj", "Emek.Application/"]
COPY ["Emek.Domain/Emek.Domain.csproj", "Emek.Domain/"]
COPY ["Emek.Infrastructure/Emek.Infrastructure.csproj", "Emek.Infrastructure/"]
COPY ["Emek.Persistence/Emek.Persistence.csproj", "Emek.Persistence/"]

# Restore dependencies
RUN dotnet restore "Emek.API/Emek.API.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/Emek.API"
RUN dotnet build "Emek.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Emek.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "Emek.API.dll"]

