@echo off
title LIZA AI Windows Companion Runner
cd /d "%~dp0"
echo Starting LIZA Windows Companion on 127.0.0.1:8765...
python main.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Running failed. Attempting dependency install...
    pip install -r requirements.txt
    python main.py
)
pause
