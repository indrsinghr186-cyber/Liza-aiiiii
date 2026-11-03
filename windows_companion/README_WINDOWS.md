# LIZA AI — Windows 11 Desktop Companion Guide

**Device Target:** Dell Latitude 7420  
**Operating System:** Windows 11 (64-bit)  
**Owner:** Paramveer Rawat  
**Default Persona:** LIZA (Sweet Anime Girl / Gemini Lyra Voice)  
**Agent Port:** `http://127.0.0.1:8765`  
**Security Token:** `liza-paramveer-dell-7420`  

---

## Quick Start (Two Ways to Run)

### Method 1: Instant Python Launch (No Compiling Required)
1. Ensure Python 3.10+ is installed on your Dell Latitude 7420 with *"Add python.exe to PATH"* checked.
2. Open the `windows_companion` folder.
3. Double-click `run_companion.bat`.
   - It will automatically install `requirements.txt` on the first run.
   - The LIZA companion icon will appear in your Windows 11 taskbar system tray.

### Method 2: Build Standalone Executable (`LIZACompanion.exe`)
1. In the `windows_companion` folder, double-click `build_companion.bat`.
2. PyInstaller will compile everything into `dist\LIZACompanion\LIZACompanion.exe`.
3. Double-click `LIZACompanion.exe` to run the resident desktop agent anytime.

---

## What Voice Commands LIZA Understands on Windows 11

### 1. Mouse Control
- *"Liza, mouse thoda right le jao"*
- *"Cursor left karo / up karo / down karo"*
- *"Double click karo"*
- *"Right click karo"*
- *"Scroll down karo / thoda scroll up karo"*

### 2. Keyboard Control
- *"Type karo: Paramveer Rawat"*
- *"Enter press karo / Escape press karo"*
- *"Ctrl C karo / Ctrl V karo"*
- *"Alt Tab press karo (Switch window)"*
- *"Win D press karo (Show desktop)"*
- *"Ctrl Shift Esc (Open Task Manager)"*

### 3. Application Launch & Window Control
- *"Chrome open karo"*
- *"YouTube open karo aur song chalao"*
- *"Notepad open karo / Calculator open karo"*
- *"File Explorer kholo / Settings kholo"*
- *"Task Manager open karo"*
- *"Is window ko close karo / maximize karo / minimize karo"*
- *"Close Notepad"*

### 4. File Management
- *"Downloads me meri PDF files find karo"*
- *"Downloads folder open karo"*
- *"Search for report in Documents"*
- *"Naya folder banao"*

### 5. Hardware & System Telemetry
- *"Battery kitni hai? (Gives real battery % on Dell Latitude 7420)"*
- *"Volume 50 percent kar do / Volume badhao / Mute karo"*
- *"Brightness 70 percent karo"*
- *"Laptop lock kar do"*
- *"Wi-Fi connected hai kya?"*

### 6. Screen Vision
- *"Liza, screen par kya hai dekho"*
- *"Is error ko explain karo"*
- *"What is open on my screen?"*

### 7. Real WhatsApp Desktop Automation & ToolRegistry
- *"Liza Rahul ko WhatsApp par Hi message bhejo"*
- *"Liza, Rahul ko Hi message bhejo"*
- *"Liza, mummy ko WhatsApp karo ki main ghar aa raha hoon"*
- *"Liza, Amit ko Happy Birthday wish karo"*
- *"Liza, Priya ko bolo main thodi der mein aaunga"*
- *"Liza, Rahul ko message bhejo: Call me when you are free"*
- *"Usko bol dena ki main busy hoon (Targets last contacted recipient)"*
- *"Rahul ko good morning bhej do"*
- *"Mummy ko bata do ki main pahunch gaya"*
- *"Last contact ko hello bhejo"*

#### Real Windows Automation Pipeline:
1. **No Fake Success Responses:** LIZA NEVER claims a message was sent or WhatsApp was opened without actual Windows automation execution and UI checkmark verification.
2. **Detection & Activation:** Checks if WhatsApp Desktop is installed/running on Windows 11. If installed, activates the window; otherwise opens WhatsApp Web in browser.
3. **Contact Search & Disambiguation:** Focuses WhatsApp search (`Ctrl+F`), clears search box, types recipient (e.g. `Rahul`), and verifies search results. If ambiguous (e.g., *Rahul Sharma* vs *Rahul Verma*), asks user to choose without guessing.
4. **Message Composition & Preview:** Types the message into the active conversation input box without pressing Enter. Returns `delivery_status: typed`.
5. **Confirmation Preview:** Shows interactive HUD preview card with formatted message. LIZA asks verbally: *"Rahul ko 'Hi' bhejna hai. Ye message bhej doon?"*
6. **Execution Verification:** Only after verbal confirmation (*"Haan / Bhej do"*), presses `Enter`, monitors conversation UI, and verifies checkmarks (`typed` -> `sent` -> `delivered` -> `read`).
7. **9-Stage Execution Audit Logs:**
   - `WHATSAPP_TOOL_REQUESTED`
   - `WHATSAPP_LAUNCH_STARTED`
   - `WHATSAPP_LAUNCH_SUCCESS`
   - `CONTACT_SEARCH_STARTED`
   - `CONTACT_FOUND`
   - `MESSAGE_COMPOSED`
   - `USER_CONFIRMATION_RECEIVED`
   - `MESSAGE_SEND_ATTEMPTED`
   - `MESSAGE_SEND_VERIFIED`


