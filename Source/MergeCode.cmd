@echo off
setlocal enabledelayedexpansion

:: ------------------------------------------------------------------
:: Configuration
:: ------------------------------------------------------------------
set "ExcludedDirs=.vs .git migrations Migrations obj bin pkg lib"
set "AllowedExts=.sln .csproj .cs .razor .json"

:: ------------------------------------------------------------------
:: Step 1: Handle the input for RelativePath
:: ------------------------------------------------------------------
set "RelativePath=%~1"
set "DebugMode=0"

:: Check for debug argument
for %%A in (%*) do (
    if "%%A"=="-d" set "DebugMode=1"
    if "%%A"=="--debug" set "DebugMode=1"
)

if "%RelativePath%"=="-d" set "RelativePath=%~2"
if "%RelativePath%"=="--debug" set "RelativePath=%~2"
if "%RelativePath%"=="" set "RelativePath=."
if "%RelativePath%"=="\" set "RelativePath=."
if "%RelativePath%"=="/" set "RelativePath=."

:: Disallow parent path references ("..")
if "%RelativePath:..=%" neq "%RelativePath%" (
    echo Error: Parent path references ^(".."^) are not allowed.
    exit /b 1
)

:: Disallow root-level references ("\\")
if "!RelativePath:~0,2!"=="\\" (
    echo Error: Root-level references ^("\\"^) are not allowed in relative paths.
    exit /b 1
)

:: Strip leading "./", ".\", or "\"
:strip
if "!RelativePath:~0,1!"=="\" set "RelativePath=!RelativePath:~1!" & goto strip
if "!RelativePath:~0,1!"=="." set "RelativePath=!RelativePath:~1!" & goto strip

:: ------------------------------------------------------------------
:: Step 2: Construct the AbsolutePath
:: ------------------------------------------------------------------
set "AbsolutePath=%CD%\!RelativePath!"
set "AbsolutePath=!AbsolutePath:/=\!"     :: Normalize forward slashes to backslashes

:collapse
if not "!AbsolutePath!"=="!AbsolutePath:\\=\!" set "AbsolutePath=!AbsolutePath:\\=\!" & goto collapse

:: Ensure the path does not end with a backslash
if "!AbsolutePath:~-1!"=="\" set "AbsolutePath=!AbsolutePath:~0,-1!"

:: Verify the AbsolutePath exists
if not exist "!AbsolutePath!" (
    echo Error: Path "!AbsolutePath!" does not exist.
    exit /b 1
)

:: ------------------------------------------------------------------
:: Step 3: Derive Output File Name
:: ------------------------------------------------------------------
for %%I in ("%CD%") do set "CurrentFolderName=%%~nI"

if "%RelativePath%"=="" (
    set "FileName=!CurrentFolderName!.src"
) else (
    set "RelativePathDots=!RelativePath:\=.!"
    set "FileName=!CurrentFolderName!.!RelativePathDots!.src"
)

set "OutputFile=%CD%\!FileName!"
if exist "%OutputFile%" del "%OutputFile%"
echo Creating "!FileName!" @ %CD%...

:: Log initialization
set "LogFile=nul"
if "!DebugMode!"=="1" set "LogFile=%CD%\MergeCode.log"
echo Log for merging script run at %date% %time% > "%LogFile%"
echo Creating "!FileName!" @ %CD%... >> "%LogFile%"


:: ------------------------------------------------------------------
:: Step 4: Process the folder tree
:: ------------------------------------------------------------------
pushd "!AbsolutePath!"
call :ProcessFolder "!AbsolutePath!" 0
popd

echo.
echo Done. Merged files into "%OutputFile%"
echo Done. Merged files into "%OutputFile%" >> "%LogFile%"
exit /b

:: ------------------------------------------------------------------
:: :ProcessFolder
::   %~1 - Folder path (minus trailing backslash)
::   %~2 - Current depth level
:: ------------------------------------------------------------------
:ProcessFolder
setlocal enabledelayedexpansion

set "FolderPath=%~1"
set "Level=%~2"

:: Calculate indentation
set "Tb=  "
set /a "IndentLevel=!Level!*2"
set "Indent="
for /L %%T in (1,1,!IndentLevel!) do set "Indent=!Indent!!Tb!"

:: Count files/folders in this directory
for /F "tokens=*" %%A in ('dir /b /a-d "%FolderPath%" 2^>nul ^| find /v /c ""') do set "FileCount=%%A"
for /F "tokens=*" %%B in ('dir /b /ad  "%FolderPath%" 2^>nul ^| find /v /c ""') do set "FolderCount=%%B"
set /a "Total=!FileCount!+!FolderCount!"

if "!Total!"=="0" goto :skip_folder

:: Determine folder name
for %%I in ("!FolderPath!") do set "FolderName=%%~nI%%~xI"

:: Print <root> or <folder> depending on level
if "!Level!"=="0" (
    echo ^<root name="!FolderName!"^> >> "%OutputFile%"
) else (
    echo !Indent!^<folder name="!FolderName!"^> >> "%OutputFile%"
)

echo Processing folder: "!FolderName!" >> "%LogFile%"

:: Process files
if "!FileCount!" neq "0" call :ProcessFiles "!FolderPath!" "!Indent!"

:: Process subfolders
if "!FolderCount!" neq "0" call :ProcessFolders "!FolderPath!" "!Indent!" "!Level!"

:: Close </root> or </folder>
if "!Level!"=="0" (
    echo ^</root^> >> "%OutputFile%"
) else (
    echo !Indent!^</folder^> >> "%OutputFile%"
)

:skip_folder
endlocal
exit /b

:: ------------------------------------------------------------------
:: :ProcessFiles
::   %~1 - Folder path
::   %~2 - Indent
:: ------------------------------------------------------------------
:ProcessFiles
setlocal enabledelayedexpansion

set "HasFile=0"
for %%F in ("%~1\*") do (
    if /I not "%%~aF"=="d" (
        set "SkipFile=1"
        for %%A in (%AllowedExts%) do (
            if "%%~xF"=="%%~A" set "SkipFile=0"
        )

        if "!SkipFile!"=="0" (
            set "AddedFile=%%F"
            echo Adding file: "!AddedFile:%AbsolutePath%=!"
            echo Adding file: "!AddedFile:%AbsolutePath%=!" >> "%LogFile%"
            if "!HasFile!"=="0" echo %~2!Tb!^<files^> >> "%OutputFile%"
            set "HasFile=1"

            echo %~2!Tb!!Tb!^<file name="%%~nxF"^>^<^^![CDATA[ >> "%OutputFile%"
            type "%%~fF" >> "%OutputFile%"
            echo %~2!Tb!!Tb!]]^>^</file^> >> "%OutputFile%"
        )
    )
)

if "!HasFile!"=="1" (
    echo %~2!Tb!^</files^> >> "%OutputFile%"
)

echo Processed files in folder: "%~1" >> "%LogFile%"
endlocal
exit /b

:: ------------------------------------------------------------------
:: :ProcessFolders
::   %~1 - Folder path
::   %~2 - Indent
::   %~3 - Level
:: ------------------------------------------------------------------
:ProcessFolders
setlocal enabledelayedexpansion

set "HasFolder=0"
for /D %%D in ("%~1\*") do (
    set "SkipSub=0"

    :: Check exclusion
    for %%E in (%ExcludedDirs%) do (
        if "%%~nD"=="%%~E" set "SkipSub=1"
    )

    if "!SkipSub!"=="0" (
        if "!HasFolder!"=="0" echo %~2!Tb!^<folders^> >> "%OutputFile%"
        set "HasFolder=1"

        set /a "NewLevel=%~3+1"
        call :ProcessFolder "%%~fD" !NewLevel!
    )
)

if "!HasFolder!"=="1" (
    echo %~2!Tb!^</folders^> >> "%OutputFile%"
)

echo Processed subfolders in folder: "%~1" >> "%LogFile%"
endlocal
exit /b
