@echo off
setlocal enabledelayedexpansion

:: Define excluded directories
set "ExcludedDirs=.vs .git migrations Migrations obj bin pkg lib"
set "AllowedExts=.cs .razor .css .js .map .json .http .cmd .csproj .csproj.user .sln.user .sln"

:: Set the base folder and output file name
set BaseFolder=%CD%\%~1
if "%~1"=="" (set BaseFolder=%CD%)
set OutputFileName=%~1.txt
if "%~1"=="." (for %%f in ("%CD%") do set OutputFileName=%%~nxf.txt)
if "%~1"=="" (for %%f in ("%CD%") do set OutputFileName=%%~nxf.txt)
set OutputFile=%CD%\%OutputFileName%

:: Ensure the output file is empty
if exist "%OutputFile%" del "%OutputFile%"

echo Creating %OutputFileName% @ %CD%...

:: Navigate to the base folder
pushd !BaseFolder!

:: Define method for checking allowed extensions
:ProcessFiles
:: List and process files sorted by name
for /F "delims=" %%f in ('dir /b /a-d /on') do (
    set "FileExt=%%~xf"
    set "FilePath=%%f"
    set skipFile=1
    if /I "!FileExt!"=="" (
        set skipFile=0
    )
    if !skipFile!==1 (
        for %%a in (%AllowedExts%) do (
            if /I "!FileExt!"=="%%a" (
                set skipFile=0
            )
        )
    )

    set "RelPath=!FilePath:%BaseFolder%\=!"
    if !skipFile!==1 (echo "%RelPath% [Skipped]")
    if !skipFile!==0 (
        :: If the file is not in an excluded folder, process it
        echo ---------------------------------------------------------------------------------------- >> "%OutputFile%"
        echo !RelPath!
        echo !RelPath! >> "%OutputFile%"
        type "%%f" >> "%OutputFile%"
        echo. >> "%OutputFile%"
    )
)
goto :eof

:: Loop through all code files in the base folder and its subfolders
for /R /D %%d in (*) do (
    :: Check if the current directory is in the exclusion list
    set skipDir=0
    for %%e in (%ExcludedDirs%) do (
        echo %%d\ | findstr /i "\\%%e\\" >nul && set "skipDir=1" && break
    )
    if !skipDir!==1 (echo "%%d [Skipped]")
    if !skipDir!==0 (
        :: Navigate to the current directory
        pushd "%%d"
        
        :: Return to the previous directory
        popd
    )
)

:: Return to the original directory
popd
echo:
echo Done. Merged files into "%OutputFile%"

goto :eof