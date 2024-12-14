@echo off
setlocal enabledelayedexpansion

:: Set the base folder and output file name
set BaseFolder=%~1
if "%~1"=="" (set BaseFolder=".")
set OutputFile=%~1.txt
if "%~1"=="." (for %%f in ("%CD%") do set OutputFile=%%~nxf.txt)
if "%~1"=="" (for %%f in ("%CD%") do set OutputFile=%%~nxf.txt)

:: Ensure the output file is empty
if exist "%OutputFile%" del "%OutputFile%"

echo Starting...
:: Loop through all code files in the base folder and its subfolders
for /r "%BaseFolder%" %%f in (*.cs *.razor *.css *.js *.json) do (
    set "FilePath=%%f"
    set "SkipFile=0"
	echo | set /p=.

    :: Check if the file path contains any of the excluded folders
    for %%d in (.vs .git migrations obj bin pkg lib) do (
        echo !FilePath! | findstr /i "\\%%d\\" >nul && set "SkipFile=1" && break
    )

    :: If the file is not in an excluded folder, process it
    if !SkipFile! equ 0 (
        set "RelPath=!FilePath:%CD%\%BaseFolder%\=!"
        echo ---------------------------------------------------------------------------------------- >> "%OutputFile%"
        echo !RelPath! >> "%OutputFile%"
        type "%%f" >> "%OutputFile%"
        echo. >> "%OutputFile%"
    )
)
echo:
echo Done. Merged files into "%OutputFile%"
