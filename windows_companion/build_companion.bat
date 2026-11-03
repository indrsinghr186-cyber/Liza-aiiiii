@echo off
echo ========================================================
echo   LIZA AI - WINDOWS 11 COMPANION COMPILER
echo   Device: Dell Latitude 7420 ^| Owner: Paramveer Rawat
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking and installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Dependency installation failed. Please verify Python 3.10+ is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building standalone executable with PyInstaller...
pyinstaller --noconfirm --onedir --windowed ^
    --name "LIZACompanion" ^
    --hidden-import "fastapi" ^
    --hidden-import "uvicorn" ^
    --hidden-import "pyautogui" ^
    --hidden-import "psutil" ^
    --hidden-import "pycaw" ^
    --hidden-import "PySide6" ^
    --hidden-import "PIL" ^
    --hidden-import "win32gui" ^
    --hidden-import "win32con" ^
    main.py

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PyInstaller build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Build completed successfully!
echo Executable location: "%~dp0dist\LIZACompanion\LIZACompanion.exe"
echo.
echo To run LIZA Companion, double-click LIZACompanion.exe or run run_companion.bat.
pause
