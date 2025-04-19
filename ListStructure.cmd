@echo off
setlocal enabledelayedexpansion

REM --- Configuration ---
set outputFile=Design/PROJECT_STRUCTURE.md
set "indentSpaces=  " REM Two spaces per indentation level
set "excludeDirs=.git .vs .cursor .github .vscode bin obj pkg lib node_modules Properties TestResults CoverageReports uploads"
set "AllowedExts=.md .slnx .sln .csproj .cs .razor .json .html .css"
REM --- End Configuration ---

REM Create or clear the output file and add a header
echo # Project Structure > "%outputFile%"
echo. >> "%outputFile%"

REM Start the recursive processing from the current directory (.) with no initial indent
echo Processing...
call :ProcessDirectory "." ""

echo Project structure saved as Markdown list to %outputFile%
endlocal
goto :eof

REM --- Subroutine to process directories recursively ---
:ProcessDirectory
set "currentDir=%~1"
set "indent=%~2"

REM --- Process Files First ---
REM Use 'dir /b /a-d /on' to get only files, sorted by name
for /F "delims=" %%F in ('dir /b /a-d /on "%currentDir%" 2^>nul') do (
    set "fileName=%%F"
    REM Check if the file should be excluded
    set "isExcluded=1"
    for %%A in (%AllowedExts%) do (
        if /I "%%~xF"=="%%~A" set "isExcluded=0"
    )
    REM If not excluded, print its name
    if !isExcluded! equ 0 (
        echo %indent%- !fileName! >> "%outputFile%"
    )
)

REM --- Process Directories Second ---
REM Use 'dir /b /ad /on' to get only directories, sorted by name
for /F "delims=" %%D in ('dir /b /ad /on "%currentDir%" 2^>nul') do (
    set "dirName=%%D"
    set "fullDirPath=%currentDir%\%%D"
    REM Check if the directory should be excluded
    set "isExcluded=0"
    for %%X in (%excludeDirs%) do (
        if /I "!dirName!"=="%%~X" set "isExcluded=1"
    )
    REM If not excluded, print its name and recurse
    if !isExcluded! equ 0 (
        echo %indent%- **!dirName!** >> "%outputFile%"
        call :ProcessDirectory "!fullDirPath!" "%indent%%indentSpaces%"
    )
)

goto :eof
