FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ProjectTracker.Api/ProjectTracker.Api.csproj ./ProjectTracker.Api/
RUN dotnet restore ./ProjectTracker.Api/ProjectTracker.Api.csproj

COPY . .
RUN dotnet publish ./ProjectTracker.Api/ProjectTracker.Api.csproj \
    -c Release \
    --no-restore \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ProjectTracker.Api.dll"]
