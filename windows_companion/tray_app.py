"""
LIZA AI — Windows 11 System Tray & Runtime Companion
PySide6 Application running in the background with system tray integration
"""

import sys
import os
import threading
import webbrowser
import uvicorn
from PySide6.QtWidgets import (
    QApplication, QSystemTrayIcon, QMenu, QMessageBox, QWidget,
    QVBoxLayout, QLabel, QPushButton, QTextEdit
)
from PySide6.QtGui import QIcon, QPixmap, QColor, QPainter, QFont
from PySide6.QtCore import Qt, QTimer

from companion_server import app as fastapi_app
from system_controls import WindowsSystemController

RUN_REG_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "LIZACompanion"


def set_autostart(enable: bool) -> bool:
    """Sets or removes Windows Startup Registry Entry."""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_REG_KEY, 0, winreg.KEY_ALL_ACCESS)
        exe_path = sys.executable
        if enable:
            winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, f'"{exe_path}"')
        else:
            try:
                winreg.DeleteValue(key, APP_NAME)
            except FileNotFoundError:
                pass
        winreg.CloseKey(key)
        return True
    except Exception as e:
        print(f"Autostart registry error: {e}")
        return False


def is_autostart_enabled() -> bool:
    """Checks if Windows Startup Registry Entry is active."""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_REG_KEY, 0, winreg.KEY_READ)
        try:
            val, _ = winreg.QueryValueEx(key, APP_NAME)
            winreg.CloseKey(key)
            return bool(val)
        except FileNotFoundError:
            winreg.CloseKey(key)
            return False
    except Exception:
        return False


def create_tray_icon() -> QIcon:
    """Dynamically generates a sharp futuristic JARVIS/LIZA icon pixmap."""
    pixmap = QPixmap(64, 64)
    pixmap.fill(Qt.transparent)
    painter = QPainter(pixmap)
    painter.setRenderHint(QPainter.Antialiasing)

    # Outer glowing ring (Indigo / Cyan)
    painter.setPen(Qt.NoPen)
    painter.setBrush(QColor(99, 102, 241))  # Indigo
    painter.drawEllipse(4, 4, 56, 56)

    # Inner dark core
    painter.setBrush(QColor(15, 23, 42))  # Slate 900
    painter.drawEllipse(10, 10, 44, 44)

    # Center glowing jewel (Cyan)
    painter.setBrush(QColor(6, 182, 212))  # Cyan 500
    painter.drawEllipse(22, 22, 20, 20)

    # L letter
    painter.setPen(QColor(255, 255, 255))
    font = QFont("Arial", 16, QFont.Bold)
    painter.setFont(font)
    painter.drawText(pixmap.rect(), Qt.AlignCenter, "L")

    painter.end()
    return QIcon(pixmap)


class StatusDialog(QWidget):
    def __init__(self, controller: WindowsSystemController):
        super().__init__()
        self.controller = controller
        self.setWindowTitle("LIZA Windows Companion — Telemetry & Status")
        self.resize(420, 360)
        self.setStyleSheet("""
            QWidget {
                background-color: #0b0f19;
                color: #e2e8f0;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            QLabel {
                font-size: 13px;
            }
            QPushButton {
                background-color: #4f46e5;
                color: white;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #4338ca;
            }
            QTextEdit {
                background-color: #030712;
                border: 1px solid #1f2937;
                color: #38bdf8;
                font-family: 'Consolas', monospace;
                font-size: 11px;
            }
        """)

        layout = QVBoxLayout()
        self.title_label = QLabel("🤖 <b>LIZA Windows Companion Agent</b>")
        self.title_label.setStyleSheet("font-size: 16px; color: #818cf8;")
        layout.addWidget(self.title_label)

        self.device_label = QLabel("💻 Device: Dell Latitude 7420 | OS: Windows 11")
        self.owner_label = QLabel("👑 Owner: Paramveer Rawat | Port: 127.0.0.1:8765")
        layout.addWidget(self.device_label)
        layout.addWidget(self.owner_label)

        self.telemetry_box = QTextEdit()
        self.telemetry_box.setReadOnly(True)
        layout.addWidget(self.telemetry_box)

        self.refresh_btn = QPushButton("Refresh Telemetry")
        self.refresh_btn.clicked.connect(self.update_telemetry)
        layout.addWidget(self.refresh_btn)

        self.setLayout(layout)
        self.update_telemetry()

    def update_telemetry(self):
        data = self.controller.get_system_telemetry()
        bat = data.get("battery", {})
        text = (
            f"=== REAL-TIME TELEMETRY ===\n"
            f"Active Window:  {data.get('active_window')}\n"
            f"Battery Level:  {bat.get('percent', 'N/A')}%\n"
            f"Power State:    {'Charging / AC Connected' if bat.get('power_plugged') else 'Discharging on Battery'}\n"
            f"Master Volume:  {data.get('volume', 'N/A')}%\n"
            f"CPU Usage:      {data.get('cpu_percent', 'N/A')}%\n"
            f"RAM Usage:      {data.get('memory_percent', 'N/A')}%\n"
            f"Local Loopback: http://127.0.0.1:8765 (ACTIVE)\n"
        )
        self.telemetry_box.setText(text)


class LizaCompanionTrayApp:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setQuitOnLastWindowClosed(False)
        self.controller = WindowsSystemController()

        self.tray = QSystemTrayIcon()
        self.tray.setIcon(create_tray_icon())
        self.tray.setToolTip("LIZA AI Companion — Dell Latitude 7420 (Port 8765)")

        self.status_dialog = None
        self.setup_menu()
        self.tray.show()

        # Start FastAPI in background daemon thread
        self.server_thread = threading.Thread(target=self.run_fastapi, daemon=True)
        self.server_thread.start()

    def setup_menu(self):
        menu = QMenu()

        open_hud = menu.addAction("🌐 Open LIZA Desktop HUD")
        open_hud.triggered.connect(self.open_hud_browser)

        status_action = menu.addAction("📊 Status & Diagnostics")
        status_action.triggered.connect(self.show_status)

        menu.addSeparator()

        self.autostart_action = menu.addAction("🚀 Start with Windows")
        self.autostart_action.setCheckable(True)
        self.autostart_action.setChecked(is_autostart_enabled())
        self.autostart_action.triggered.connect(self.toggle_autostart)

        menu.addSeparator()

        quit_action = menu.addAction("❌ Exit LIZA Companion")
        quit_action.triggered.connect(self.quit_app)

        self.tray.setContextMenu(menu)

    def open_hud_browser(self):
        webbrowser.open("http://localhost:3000")

    def show_status(self):
        if not self.status_dialog:
            self.status_dialog = StatusDialog(self.controller)
        self.status_dialog.show()
        self.status_dialog.raise_()

    def toggle_autostart(self):
        new_state = self.autostart_action.isChecked()
        set_autostart(new_state)

    def run_fastapi(self):
        uvicorn.run(fastapi_app, host="127.0.0.1", port=8765, log_level="warning")

    def quit_app(self):
        self.app.quit()

    def run(self):
        sys.exit(self.app.exec())


if __name__ == "__main__":
    companion = LizaCompanionTrayApp()
    companion.run()
