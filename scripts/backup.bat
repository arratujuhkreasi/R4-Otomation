@echo off
REM ============================================
REM FlowAutomator - Database Backup Script (Windows)
REM ============================================
REM Run: backup.bat
REM Schedule: Use Windows Task Scheduler

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=C:\backups\flowautomator
set DB_CONTAINER=flowautomator-db
set DB_USER=flowautomator
set DB_NAME=flowautomator

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
set BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

echo ==========================================
echo FlowAutomator Database Backup
echo ==========================================
echo Time: %date% %time%
echo Backup file: %BACKUP_FILE%

REM Create backup
echo Creating backup...
docker exec %DB_CONTAINER% pg_dump -U %DB_USER% %DB_NAME% > "%BACKUP_FILE%"

REM Compress (if 7-Zip installed)
if exist "C:\Program Files\7-Zip\7z.exe" (
    echo Compressing backup...
    "C:\Program Files\7-Zip\7z.exe" a -tgzip "%BACKUP_FILE%.gz" "%BACKUP_FILE%" >nul
    del "%BACKUP_FILE%"
    set BACKUP_FILE=%BACKUP_FILE%.gz
)

echo Backup completed: %BACKUP_FILE%

REM Delete old backups (older than 7 days)
echo Cleaning old backups...
forfiles /p "%BACKUP_DIR%" /s /m backup_*.sql* /d -7 /c "cmd /c del @path" 2>nul

echo.
echo Current backups:
dir "%BACKUP_DIR%\backup_*.sql*" /b 2>nul

echo.
echo ==========================================
echo Backup completed successfully!
echo ==========================================

endlocal
