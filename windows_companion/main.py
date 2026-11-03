"""
LIZA AI — Main Windows 11 Companion Entrypoint
Executes the system tray companion or direct FastAPI server
"""

import sys
import os

# Add directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    has_gui = False
    try:
        from PySide6.QtWidgets import QApplication
        has_gui = True
    except ImportError:
        has_gui = False

    if has_gui and "--server-only" not in sys.argv:
        from tray_app import LizaCompanionTrayApp
        app = LizaCompanionTrayApp()
        app.run()
    else:
        import uvicorn
        from companion_server import app
        print("Starting LIZA Windows Companion in headless server mode on http://127.0.0.1:8765...")
        uvicorn.run(app, host="127.0.0.1", port=8765)

if __name__ == "__main__":
    main()
