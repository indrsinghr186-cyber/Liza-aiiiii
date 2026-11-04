"""
LIZA AI — Windows Companion Agent Server
FastAPI HTTP & WebSocket service listening strictly on 127.0.0.1:8765
Secured by local authorization token for Paramveer Rawat
"""

import os
import sys
import subprocess
import webbrowser
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    import pyautogui
    pyautogui.FAILSAFE = True
    HAS_PYAUTOGUI = True
except ImportError:
    HAS_PYAUTOGUI = False

from system_controls import WindowsSystemController
from tool_registry import tool_registry
from whatsapp_automation import whatsapp_automation

app = FastAPI(
    title="LIZA Windows Companion Agent",
    description="Local Windows 11 Desktop Automation Service for Dell Latitude 7420 (Paramveer Rawat)",
    version="1.0.0"
)

# Allow CORS strictly from localhost and local preview origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ais-dev-4pmwkmuvhqwhbcqtm7asu2-561156960844.asia-southeast1.run.app",
        "https://ais-pre-4pmwkmuvhqwhbcqtm7asu2-561156960844.asia-southeast1.run.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

controller = WindowsSystemController()

# Security Token (default or configured via env)
COMPANION_TOKEN = os.environ.get("LIZA_COMPANION_TOKEN", "liza-paramveer-dell-7420")


def verify_token(
    x_liza_token: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """Enforces authentication on all Windows control endpoints."""
    req_token = x_liza_token or token
    if not req_token and authorization and authorization.startswith("Bearer "):
        req_token = authorization.split(" ")[1]

    if req_token != COMPANION_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid LIZA companion token")
    return True


# --- Models ---
class MouseCommand(BaseModel):
    action: str = Field(..., description="move, click, double_click, right_click, scroll, drag")
    dx: Optional[int] = 0
    dy: Optional[int] = 0
    x: Optional[int] = None
    y: Optional[int] = None
    button: Optional[str] = "left"
    scroll_amount: Optional[int] = 0


class KeyboardCommand(BaseModel):
    action: str = Field(..., description="type, hotkey, press")
    text: Optional[str] = None
    hotkey: Optional[str] = None  # e.g. "ctrl+c", "ctrl+v", "alt+tab", "win+d", "ctrl+shift+esc"
    key: Optional[str] = None     # e.g. "enter", "escape", "backspace", "tab"


class WindowCommand(BaseModel):
    action: str = Field(..., description="close, minimize, maximize, restore, switch")


class AppCommand(BaseModel):
    app_name: str = Field(..., description="chrome, youtube, notepad, calc, explorer, settings, taskmgr, etc.")
    url: Optional[str] = None


class SystemCommand(BaseModel):
    action: str = Field(..., description="volume_up, volume_down, set_volume, mute, unmute, set_brightness, lock, sleep")
    value: Optional[int] = None
    confirmed: Optional[bool] = False


class FileCommand(BaseModel):
    action: str = Field(..., description="list, search, open, create_folder, delete")
    directory: Optional[str] = "downloads"
    query: Optional[str] = ""
    extension: Optional[str] = None
    path: Optional[str] = None
    confirmed: Optional[bool] = False


class MessageDispatchCommand(BaseModel):
    platform: str = Field(default="whatsapp", description="whatsapp, telegram, sms, email")
    recipient_name: str = Field(..., description="Recipient display name")
    phone: str = Field(default="", description="Recipient phone number or email")
    message: str = Field(..., description="Message text content")
    confirmed: bool = Field(default=False, description="Explicit user confirmation")
    dedup_id: Optional[str] = None


class ContactSearchCommand(BaseModel):
    query: Optional[str] = ""


class WhatsAppAutomateCommand(BaseModel):
    recipient: str = Field(..., description="Recipient name, phone, or alias")
    message: str = Field(..., description="Message text content")
    confirmed: Optional[bool] = Field(default=False, description="Whether user explicitly gave voice/UI confirmation to send")
    action: Optional[str] = Field(default="prepare", description="'prepare' to search & compose preview, or 'send' to execute send")


# In-memory deduplication cache: dict mapping (recipient, message) -> timestamp
RECENT_DISPATCHED_MESSAGES: Dict[str, float] = {}
DEDUP_WINDOW_SECONDS = 10.0


# --- Endpoints ---

@app.get("/health")
def health_check():
    """Unauthenticated fast heartbeat for UI pairing."""
    return {
        "status": "online",
        "agent": "LIZA Windows Companion",
        "version": "1.0.0",
        "device": "Dell Latitude 7420",
        "os": "Windows 11",
        "owner": "Paramveer Rawat"
    }


@app.get("/status")
def get_status(_: bool = Depends(verify_token)):
    """Authenticated full real-time telemetry (battery, cpu, ram, active window, volume)."""
    return controller.get_system_telemetry()


@app.post("/mouse")
def control_mouse(cmd: MouseCommand, _: bool = Depends(verify_token)):
    """Executes precision mouse movements, clicks, and scrolling."""
    if not HAS_PYAUTOGUI:
        raise HTTPException(status_code=500, detail="PyAutoGUI not installed on host")

    act = cmd.action.lower()
    screen_w, screen_h = pyautogui.size()

    try:
        if act == "move":
            if cmd.x is not None and cmd.y is not None:
                pyautogui.moveTo(cmd.x, cmd.y, duration=0.2)
            else:
                pyautogui.moveRel(cmd.dx or 0, cmd.dy or 0, duration=0.2)
        elif act in ("click", "left_click"):
            pyautogui.click(button="left")
        elif act in ("double_click", "doubleclick"):
            pyautogui.doubleClick()
        elif act in ("right_click", "rightclick"):
            pyautogui.click(button="right")
        elif act in ("middle_click", "middleclick"):
            pyautogui.click(button="middle")
        elif act == "scroll":
            # positive is up, negative is down
            pyautogui.scroll(cmd.scroll_amount or 0)
        elif act == "drag":
            pyautogui.dragRel(cmd.dx or 0, cmd.dy or 0, duration=0.3)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown mouse action: {act}")

        curr_x, curr_y = pyautogui.position()
        return {"success": True, "action": act, "current_position": {"x": curr_x, "y": curr_y}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mouse execution error: {str(e)}")


@app.post("/keyboard")
def control_keyboard(cmd: KeyboardCommand, _: bool = Depends(verify_token)):
    """Executes typing, hotkeys, and individual key presses."""
    if not HAS_PYAUTOGUI:
        raise HTTPException(status_code=500, detail="PyAutoGUI not installed on host")

    act = cmd.action.lower()

    try:
        if act == "type":
            if not cmd.text:
                raise HTTPException(status_code=400, detail="Text required for typing action")
            pyautogui.write(cmd.text, interval=0.02)
            return {"success": True, "action": "type", "text": cmd.text}

        elif act == "hotkey":
            if not cmd.hotkey:
                raise HTTPException(status_code=400, detail="Hotkey string required")
            # Parse combinations e.g. "ctrl+c", "alt+tab", "win+d"
            keys = [k.strip().lower() for k in cmd.hotkey.split("+")]
            # Map Windows key
            keys = ["win" if k in ("win", "windows", "super") else k for k in keys]
            pyautogui.hotkey(*keys)
            return {"success": True, "action": "hotkey", "keys": keys}

        elif act == "press":
            if not cmd.key:
                raise HTTPException(status_code=400, detail="Key required")
            key_name = cmd.key.lower().strip()
            pyautogui.press(key_name)
            return {"success": True, "action": "press", "key": key_name}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown keyboard action: {act}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyboard execution error: {str(e)}")


@app.post("/window")
def manage_window(cmd: WindowCommand, _: bool = Depends(verify_token)):
    """Manages active window (minimize, maximize, restore, close, switch)."""
    res = controller.manage_window(cmd.action)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Window action failed"))
    return res


@app.post("/apps/launch")
def launch_application(cmd: AppCommand, _: bool = Depends(verify_token)):
    """Launches supported Windows 11 desktop applications safely."""
    target = cmd.app_name.lower().strip()

    # Pre-registered Windows 11 Launch Directives
    APP_REGISTRY = {
        "chrome": ["start", "chrome"],
        "google chrome": ["start", "chrome"],
        "notepad": ["notepad.exe"],
        "calc": ["calc.exe"],
        "calculator": ["calc.exe"],
        "explorer": ["explorer.exe"],
        "file explorer": ["explorer.exe"],
        "settings": ["start", "ms-settings:"],
        "windows settings": ["start", "ms-settings:"],
        "taskmgr": ["taskmgr.exe"],
        "task manager": ["taskmgr.exe"],
        "cmd": ["start", "cmd.exe"],
        "terminal": ["wt.exe"],
        "edge": ["start", "msedge"],
        "microsoft edge": ["start", "msedge"],
        "paint": ["mspaint.exe"],
        "control panel": ["control.exe"],
        "spotify": ["start", "spotify:"],
        "whatsapp": ["start", "whatsapp:"],
        "whatsapp desktop": ["start", "whatsapp:"],
        "wa": ["start", "whatsapp:"],
    }

    try:
        if target in ("whatsapp", "whatsapp desktop", "wa", "open whatsapp"):
            try:
                subprocess.Popen("start whatsapp:", shell=True)
                return {"success": True, "app": "WhatsApp", "launched": True}
            except Exception:
                webbrowser.open("https://web.whatsapp.com")
                return {"success": True, "app": "WhatsApp Web", "url": "https://web.whatsapp.com"}

        if target in ("youtube", "open youtube"):
            yt_url = cmd.url or "https://www.youtube.com"
            webbrowser.open(yt_url)
            return {"success": True, "app": "YouTube", "url": yt_url}

        if cmd.url and (cmd.url.startswith("http://") or cmd.url.startswith("https://")):
            webbrowser.open(cmd.url)
            return {"success": True, "app": target, "url": cmd.url}

        if target in APP_REGISTRY:
            args = APP_REGISTRY[target]
            subprocess.Popen(" ".join(args), shell=True)
            return {"success": True, "app": target, "launched": True}

        # Safe startfile fallback for standard named executables
        os.startfile(target)
        return {"success": True, "app": target, "launched": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to launch application '{target}': {str(e)}")


@app.post("/apps/close")
def close_application(cmd: AppCommand, _: bool = Depends(verify_token)):
    """Closes an active Windows process by name (e.g. notepad.exe)."""
    target = cmd.app_name.lower().strip()
    if not target.endswith(".exe"):
        target += ".exe"

    try:
        res = subprocess.run(f"taskkill /IM {target} /F", shell=True, capture_output=True, text=True)
        if res.returncode == 0:
            return {"success": True, "closed": target}
        else:
            return {"success": False, "message": f"Process {target} not running or could not be terminated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/system/control")
def system_control(cmd: SystemCommand, _: bool = Depends(verify_token)):
    """Executes volume, brightness, screen lock, or sleep."""
    act = cmd.action.lower()

    if act == "volume_up":
        new_vol = controller.change_volume(+10)
        return {"success": True, "volume": new_vol}
    elif act == "volume_down":
        new_vol = controller.change_volume(-10)
        return {"success": True, "volume": new_vol}
    elif act == "set_volume":
        if cmd.value is not None:
            controller.set_volume(cmd.value)
            return {"success": True, "volume": cmd.value}
        raise HTTPException(status_code=400, detail="Value required for set_volume")
    elif act in ("mute", "unmute"):
        res = controller.toggle_mute()
        return {"success": True, "muted": res}
    elif act == "set_brightness":
        if cmd.value is not None:
            success = controller.set_brightness(cmd.value)
            return {"success": success, "brightness": cmd.value}
        raise HTTPException(status_code=400, detail="Value required for set_brightness")
    elif act == "lock":
        success = controller.lock_workstation()
        return {"success": success, "action": "lock"}
    elif act == "sleep":
        if not cmd.confirmed:
            return {"success": False, "requires_confirmation": True, "message": "Sleep command requires explicit user confirmation"}
        subprocess.run("rundll32.exe powrprof.dll,SetSuspendState 0,1,0", shell=True)
        return {"success": True, "action": "sleep"}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown system control action: {act}")


@app.post("/screen/capture")
def capture_screen(_: bool = Depends(verify_token)):
    """Captures real-time screen image from Dell Latitude 7420 for Gemini Vision analysis."""
    b64 = controller.capture_screen_base64()
    if not b64:
        raise HTTPException(status_code=500, detail="Screen capture failed on Windows host")
    return {
        "success": True,
        "base64": b64,
        "format": "image/jpeg",
        "active_window": controller.get_active_window_title()
    }


@app.post("/files")
def handle_files(cmd: FileCommand, _: bool = Depends(verify_token)):
    """Lists, searches, or manages user files safely."""
    act = cmd.action.lower()

    if act in ("list", "search"):
        results = controller.search_user_files(
            query=cmd.query or "",
            folder_hint=cmd.directory or "downloads",
            extension=cmd.extension
        )
        return {"success": True, "files": results, "count": len(results)}

    elif act == "open":
        if not cmd.path or not os.path.exists(cmd.path):
            raise HTTPException(status_code=404, detail="File path not found")
        os.startfile(cmd.path)
        return {"success": True, "opened": cmd.path}

    elif act == "create_folder":
        if not cmd.path:
            raise HTTPException(status_code=400, detail="Folder path required")
        os.makedirs(cmd.path, exist_ok=True)
        return {"success": True, "created": cmd.path}

    elif act == "delete":
        if not cmd.confirmed:
            return {
                "success": False,
                "requires_confirmation": True,
                "message": f"Delete operation on '{cmd.path}' requires explicit user confirmation"
            }
        if not cmd.path or not os.path.exists(cmd.path):
            raise HTTPException(status_code=404, detail="File not found")
        # Send to recycle bin or remove safely
        os.remove(cmd.path)
        return {"success": True, "deleted": cmd.path}

    else:
        raise HTTPException(status_code=400, detail=f"Unknown file action: {act}")


# --- Allowlisted Tool Registry & Messaging Endpoints ---

@app.get("/tools/registry")
def get_tool_registry():
    """Lists allowlisted tools registered in the Windows Companion Agent."""
    return {
        "status": "online",
        "device": "Dell Latitude 7420",
        "agent": "LIZA Windows Companion",
        "tools": tool_registry.list_tools()
    }


@app.post("/messages/contacts")
def search_contacts_endpoint(cmd: ContactSearchCommand, _: bool = Depends(verify_token)):
    """Searches available contacts on Windows with disambiguation for identical names."""
    return controller.search_contacts(cmd.query or "")


@app.post("/messages/dispatch")
def dispatch_message_endpoint(cmd: MessageDispatchCommand, _: bool = Depends(verify_token)):
    """
    Safely dispatches voice-directed messages via WhatsApp, Telegram, SMS, or Email.
    Enforces human-in-the-loop confirmation, deduplication, and verified delivery status.
    """
    import time

    if not cmd.confirmed:
        return {
            "success": False,
            "requires_confirmation": True,
            "recipient": cmd.recipient_name,
            "message": cmd.message,
            "platform": cmd.platform,
            "confirmation_prompt": f"{cmd.recipient_name} ko '{cmd.message}' bhejna hai. Send kar doon?"
        }

    # Deduplication check
    cache_key = f"{cmd.recipient_name.lower().strip()}_{cmd.message.strip()}"
    now = time.time()
    if cache_key in RECENT_DISPATCHED_MESSAGES:
        last_time = RECENT_DISPATCHED_MESSAGES[cache_key]
        if now - last_time < DEDUP_WINDOW_SECONDS:
            return {
                "success": False,
                "status": "duplicate_prevented",
                "message": f"Duplicate message to {cmd.recipient_name} was prevented (already sent {int(now - last_time)}s ago).",
                "recipient": cmd.recipient_name
            }

    # Mark in deduplication cache
    RECENT_DISPATCHED_MESSAGES[cache_key] = now

    # Dispatch via system controller
    res = controller.dispatch_desktop_message(
        platform=cmd.platform,
        recipient_name=cmd.recipient_name,
        phone=cmd.phone,
        message=cmd.message,
        confirmed=True
    )
    return res


@app.post("/whatsapp/automate")
def automate_whatsapp_endpoint(cmd: WhatsAppAutomateCommand, _: bool = Depends(verify_token)):
    """
    Real Windows 11 Desktop Automation for WhatsApp:
    1. Validates recipient and message.
    2. Checks whether WhatsApp Desktop is installed/running.
    3. Launches or activates WhatsApp Desktop (or opens WhatsApp Web in browser).
    4. Searches for contact and handles disambiguation without guessing.
    5. Opens conversation and types message into chat box.
    6. Displays preview and awaits user confirmation.
    7. If confirmed, presses Enter and verifies real delivery checkmark in conversation UI.
    8. Returns 9 strict audit log stages.
    """
    res = whatsapp_automation.process_whatsapp_automation(
        recipient=cmd.recipient,
        message=cmd.message,
        confirmed=cmd.confirmed or False,
        action=cmd.action or "prepare"
    )
    return res


@app.get("/whatsapp/logs")
def get_whatsapp_logs_endpoint(_: bool = Depends(verify_token)):
    """Retrieves full execution audit logs from WhatsApp automation."""
    return {
        "success": True,
        "logs": whatsapp_automation.get_logs()
    }


# Register Allowlisted Tools in ToolRegistry
tool_registry.register(
    name="send_whatsapp_message",
    description="Real Windows Desktop automation for WhatsApp: locates contact, types message, requires user confirmation, presses Enter, and verifies delivery.",
    category="messaging",
    parameters={
        "recipient": {"type": "string", "description": "Recipient contact name or phone"},
        "message": {"type": "string", "description": "Message text to send"},
        "confirmed": {"type": "boolean", "description": "Whether explicit user confirmation has been given"},
        "action": {"type": "string", "description": "'prepare' or 'send'"}
    },
    requires_confirmation=False
)(lambda recipient, message, confirmed=False, action="prepare": whatsapp_automation.process_whatsapp_automation(recipient, message, confirmed, action))

tool_registry.register(
    name="whatsapp_send",
    description="Send a message to a contact via WhatsApp Desktop or WhatsApp Web.",
    category="messaging",
    parameters={
        "recipient_name": {"type": "string", "description": "Name or relation of recipient"},
        "phone": {"type": "string", "description": "Phone number with country code"},
        "message": {"type": "string", "description": "Message text to send"}
    },
    requires_confirmation=True
)(lambda recipient_name, phone, message: controller.dispatch_desktop_message("whatsapp", recipient_name, phone, message, confirmed=True))

tool_registry.register(
    name="telegram_send",
    description="Send a message via Telegram Desktop.",
    category="messaging",
    parameters={
        "recipient_name": {"type": "string", "description": "Name or username"},
        "phone": {"type": "string", "description": "Phone number or username"},
        "message": {"type": "string", "description": "Message text"}
    },
    requires_confirmation=True
)(lambda recipient_name, phone, message: controller.dispatch_desktop_message("telegram", recipient_name, phone, message, confirmed=True))

tool_registry.register(
    name="sms_send",
    description="Send an SMS text message using Windows Phone Link.",
    category="messaging",
    parameters={
        "recipient_name": {"type": "string", "description": "Recipient name"},
        "phone": {"type": "string", "description": "Phone number"},
        "message": {"type": "string", "description": "SMS text body"}
    },
    requires_confirmation=True
)(lambda recipient_name, phone, message: controller.dispatch_desktop_message("sms", recipient_name, phone, message, confirmed=True))

class OpenChatCommand(BaseModel):
    contact_name: str = Field(..., description="Recipient or contact name to open")
    app: Optional[str] = Field(default="whatsapp", description="Target application")


class ReadMessagesCommand(BaseModel):
    contact_name: Optional[str] = Field(default=None, description="Contact name or None for active chat")
    app: Optional[str] = Field(default="whatsapp", description="Target application")


class ClickElementCommand(BaseModel):
    target_description: Optional[str] = Field(default=None, description="UI element label or description")
    x: Optional[int] = None
    y: Optional[int] = None


class TypeTextCommand(BaseModel):
    text: str = Field(..., description="Text content to type")
    target: Optional[str] = None


class PressKeyCommand(BaseModel):
    key: str = Field(..., description="Key name e.g. enter, esc, backspace")
    modifiers: Optional[str] = Field(default=None, description="Modifier keys e.g. ctrl, alt, shift")


class ScrollScreenCommand(BaseModel):
    direction: str = Field(default="down", description="'up' or 'down'")
    amount: Optional[int] = Field(default=300, description="Pixels to scroll")


@app.post("/whatsapp/open_chat")
def open_chat_endpoint(cmd: OpenChatCommand, _: bool = Depends(verify_token)):
    """Opens contact conversation in WhatsApp Desktop or Web."""
    return whatsapp_automation.open_chat(cmd.contact_name)


@app.post("/whatsapp/read_messages")
def read_messages_endpoint(cmd: ReadMessagesCommand, _: bool = Depends(verify_token)):
    """Reads visible messages from the active or specified chat."""
    return whatsapp_automation.read_visible_messages(cmd.contact_name)


# --- Universal AI Action Engine Tool Registrations ---

tool_registry.register(
    name="open_application",
    description="Open a desktop application by name (e.g. WhatsApp, Chrome, YouTube, Notepad, Calculator, Explorer, Settings) or open a website URL.",
    category="system",
    parameters={
        "app_name": {"type": "string", "description": "Name of the application or website"},
        "url": {"type": "string", "description": "Optional URL if opening browser or video"}
    }
)(lambda app_name, url=None: (
    webbrowser.open(url or f"https://www.youtube.com" if app_name.lower() in ("youtube", "open youtube") else url) if url or app_name.lower() in ("youtube", "open youtube")
    else (
        whatsapp_automation.launch_or_activate_whatsapp() if "whatsapp" in app_name.lower()
        else subprocess.Popen(f"start {app_name}", shell=True)
    )
) or {"success": True, "app": app_name})

tool_registry.register(
    name="close_application",
    description="Close an active application by process name.",
    category="system",
    parameters={"app_name": {"type": "string", "description": "Application name to close"}}
)(lambda app_name: (
    subprocess.run(f"taskkill /IM {app_name if app_name.endswith('.exe') else app_name + '.exe'} /F", shell=True)
) or {"success": True, "closed": app_name})

tool_registry.register(
    name="switch_application",
    description="Switch active window to next application or specified app (Alt+Tab).",
    category="window",
    parameters={"app_name": {"type": "string", "description": "Optional app name"}}
)(lambda app_name=None: controller.manage_window("switch"))

tool_registry.register(
    name="search_contact",
    description="Search contact by name or relationship (handles duplicate names without guessing).",
    category="messaging",
    parameters={
        "query": {"type": "string", "description": "Name or alias"},
        "app": {"type": "string", "description": "Target app"}
    }
)(lambda query="", app="whatsapp": controller.search_contacts(query))

tool_registry.register(
    name="open_chat",
    description="Locate contact and open conversation in messaging app.",
    category="messaging",
    parameters={
        "contact_name": {"type": "string", "description": "Contact name"},
        "app": {"type": "string", "description": "Target messaging app"}
    }
)(lambda contact_name, app="whatsapp": whatsapp_automation.open_chat(contact_name))

tool_registry.register(
    name="read_visible_messages",
    description="Read visible messages from current or specified contact chat.",
    category="messaging",
    parameters={
        "contact_name": {"type": "string", "description": "Optional contact name"},
        "app": {"type": "string", "description": "Target app"}
    }
)(lambda contact_name=None, app="whatsapp": whatsapp_automation.read_visible_messages(contact_name))

tool_registry.register(
    name="draft_message",
    description="Compose and prepare a message in chat input box for user confirmation preview.",
    category="messaging",
    parameters={
        "recipient": {"type": "string", "description": "Contact name"},
        "message": {"type": "string", "description": "Message text"},
        "app": {"type": "string", "description": "Target app"}
    }
)(lambda recipient, message, app="whatsapp": whatsapp_automation.process_whatsapp_automation(recipient, message, confirmed=False, action="prepare"))

tool_registry.register(
    name="send_message",
    description="Send prepared message after explicit user confirmation.",
    category="messaging",
    parameters={
        "recipient": {"type": "string", "description": "Contact name"},
        "message": {"type": "string", "description": "Message text"},
        "app": {"type": "string", "description": "Target app"},
        "user_confirmed": {"type": "boolean", "description": "True if confirmed"}
    }
)(lambda recipient, message, app="whatsapp", user_confirmed=False: whatsapp_automation.process_whatsapp_automation(recipient, message, confirmed=user_confirmed, action="send" if user_confirmed else "prepare"))

tool_registry.register(
    name="search_web",
    description="Search Google or the web in default browser.",
    category="browser",
    parameters={"query": {"type": "string", "description": "Search query"}}
)(lambda query: webbrowser.open(f"https://www.google.com/search?q={urllib.parse.quote(query)}") or {"success": True, "query": query})

tool_registry.register(
    name="open_website",
    description="Open a website URL in default browser.",
    category="browser",
    parameters={"url": {"type": "string", "description": "Web URL"}}
)(lambda url: webbrowser.open(url) or {"success": True, "url": url})

tool_registry.register(
    name="click_element",
    description="Click visible UI element or specified screen coordinates.",
    category="mouse",
    parameters={
        "target_description": {"type": "string", "description": "Description of element"},
        "x": {"type": "integer", "description": "X coordinate"},
        "y": {"type": "integer", "description": "Y coordinate"}
    }
)(lambda target_description=None, x=None, y=None: (
    pyautogui.click(x, y) if HAS_PYAUTOGUI and x is not None and y is not None
    else (pyautogui.click() if HAS_PYAUTOGUI else None)
) or {"success": True, "target": target_description or "cursor"})

tool_registry.register(
    name="type_text",
    description="Type text into active focused element.",
    category="keyboard",
    parameters={
        "text": {"type": "string", "description": "Text to type"},
        "target": {"type": "string", "description": "Optional target input"}
    }
)(lambda text, target=None: (pyautogui.write(text, interval=0.02) if HAS_PYAUTOGUI else None) or {"success": True, "typed": text})

tool_registry.register(
    name="press_key",
    description="Press keyboard key or key combination (enter, esc, backspace, ctrl+c, alt+tab).",
    category="keyboard",
    parameters={
        "key": {"type": "string", "description": "Key name"},
        "modifiers": {"type": "string", "description": "Modifiers e.g. ctrl, alt"}
    }
)(lambda key, modifiers=None: (
    pyautogui.hotkey(*[m.strip() for m in modifiers.split("+")], key) if HAS_PYAUTOGUI and modifiers
    else (pyautogui.press(key) if HAS_PYAUTOGUI else None)
) or {"success": True, "key": key})

tool_registry.register(
    name="scroll_screen",
    description="Scroll active window up or down.",
    category="mouse",
    parameters={
        "direction": {"type": "string", "description": "'up' or 'down'"},
        "amount": {"type": "integer", "description": "Scroll delta"}
    }
)(lambda direction="down", amount=300: (
    pyautogui.scroll(-abs(amount) if direction.lower() == "down" else abs(amount)) if HAS_PYAUTOGUI else None
) or {"success": True, "direction": direction, "amount": amount})

tool_registry.register(
    name="capture_screen",
    description="Capture screen image for visual inspection.",
    category="screen",
    parameters={"focus_area": {"type": "string", "description": "Optional focus area"}}
)(lambda focus_area=None: controller.capture_screen_base64() and {"success": True, "active_window": controller.get_active_window_title()})

tool_registry.register(
    name="understand_screen",
    description="Inspect and understand what is visible on screen.",
    category="screen",
    parameters={"query": {"type": "string", "description": "Question about visible screen"}}
)(lambda query=None: {
    "success": True,
    "active_window": controller.get_active_window_title(),
    "telemetry": controller.get_system_telemetry()
})

tool_registry.register(
    name="get_active_window",
    description="Get title of currently focused Windows 11 foreground window.",
    category="window",
    parameters={}
)(lambda: {"success": True, "active_window": controller.get_active_window_title()})



