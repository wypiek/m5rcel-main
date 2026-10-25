FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY M5rcelWin7.csproj ./
RUN dotnet restore M5rcelWin7.csproj
COPY . ./
RUN dotnet publish M5rcelWin7.csproj --configuration Release --no-restore --output /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_EnableDiagnostics=0
COPY --from=build --chown=app:app /app/publish ./
USER $APP_UID
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD ["dotnet", "M5rcelWin7.dll", "--healthcheck"]
ENTRYPOINT ["dotnet", "M5rcelWin7.dll"]
