# Dell Latitude 7420 System Health Dashboard

Add a dedicated, real-time 'System Health' dashboard component to the LIZA Windows Desktop Control Modal that visualizes CPU, GPU, and RAM usage using Recharts with live telemetry streams and Dell Latitude 7420 hardware telemetry (Intel Iris Xe GPU load, package temperature, and CPU clock frequency).

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following hardware telemetry priorities during Phase 1:
> - **Dell Latitude 7420 Specific Metrics**: Intel Iris Xe GPU load, CPU package temperature, and dynamic clock speed.
> - **Default Chart Presentation**: Synchronized multi-metric area chart with live sparklines and tabbed granular metric breakdown views.
> - **Telemetry Sliding Window**: 1-second sampling frequency with a 30-second sliding history buffer to ensure high responsiveness without frame drops.

---

## 1. Overview & Core Concept

- **What It Does**: Introduces a high-density, real-time 'System Health' tab and standalone component inside the LIZA Windows Desktop Control Modal. It monitors CPU load, Intel Iris Xe GPU utilization, RAM consumption, package temperature, and CPU core frequencies using animated Recharts AreaCharts and LineCharts, paired with live hardware status meters.
- **Target Audience / Persona**: Paramveer Rawat utilizing his Dell Latitude 7420 laptop on Windows 11 with LIZA AI as his resident assistant.
- **Key Value**: Provides immediate insight into laptop thermals, throttling state, and resource loads while running voice AI sessions, screen vision analysis, or heavy desktop applications.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Navigation**: User opens the Windows 11 Desktop Control Modal (`WIN 11` button or LIZA voice command: *"Liza, system health dikhao"* / *"Show system performance"*).
2. **Tab Selection**: A new **"System Health"** tab sits between *System Telemetry HUD* and *Mouse & Keyboard*.
3. **Real-time Live Stream**: As telemetry arrives every second from the local companion (or continuous fallback simulation if offline), Recharts renders a synchronized 30-second sliding telemetry chart with distinct gradients for CPU (Cyan), Intel Iris Xe GPU (Purple), and RAM (Emerald).
4. **Hardware Stat Cards**: Four prominent Dell Latitude 7420 hardware readout modules:
   - **CPU Module**: 11th Gen Intel Core i7 / vPro utilization percentage, instantaneous clock speed in GHz, and active core count.
   - **GPU Module**: Intel Iris Xe Graphics load percentage, video memory commit, and direct render status.
   - **RAM Module**: Total physical memory (16 GB), used memory, cached/free buffer, and percent utilization.
   - **Thermal & Power Module**: Package temperature in °C with color-coded safety indicators (Nominal <65°C, Warm 65-80°C, Hot >80°C), fan profile, and AC/battery power state.
5. **Interactive Controls**: Users can pause/resume real-time stream polling, toggle between a unified area chart and isolated individual metric cards, or clear the history buffer.

### Visual Identity & Theme
- **Color Palette**: Dark cyberpunk / JARVIS slate aesthetic:
  - Background: Obsidian/Slate-950 (`#020617` / `#0f172a`) with 1px border lines (`border-slate-800`).
  - CPU Metric: Electric Cyan (`#06b6d4`, gradient fill `#06b6d420`).
  - GPU Metric (Intel Iris Xe): Neon Purple / Violet (`#8b5cf6`, gradient fill `#8b5cf620`).
  - RAM Metric: Mint Emerald (`#10b981`, gradient fill `#10b98120`).
  - Thermal Alert: Amber (`#f59e0b`) to Rose (`#f43f5e`).
- **Typographic Discipline (Zero-Pill Restraint)**:
  - Tabular numerals (`tabular-nums font-mono`) for all percentages, clock speeds, byte counts, and timestamps to eliminate layout jitter.
  - Zero static pill badges. Metadata displayed as quiet, unboxed text separated by subtle typographic bullets (`·`).
  - Interactive filter buttons and pause toggles styled as clean segmented controls with subtle pressed elevation.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Data Source (Live Companion + High-Fidelity Dell 7420 Simulator)**
  - *Chosen Approach*: When `windows_companion` is connected, the dashboard polls real metrics via `/status` (extended with GPU and clock data via Python WMI / psutil). When running in preview without the local daemon, it seamlessly transitions into a high-fidelity Dell Latitude 7420 realistic emulator that fluctuates authentically based on LIZA's voice/vision workload.
  - *Why*: Allows immediate visual inspection and interactive testing in web preview while executing actual Windows APIs on the laptop.
  - *Alternatives Considered*: Showing an empty error screen if the Windows daemon is offline. Rejected because it breaks preview UX.

- **Decision 2: Recharts AreaChart with ResponsiveContainer & Monotone Curves**
  - *Chosen Approach*: Use SVG-based `AreaChart` with linear gradient fills and `isAnimationActive={false}` on the sliding window (with CSS transitions on markers).
  - *Why*: Recharts re-renders on sliding arrays can cause jitter if full SVG animation is enabled on every 1-second tick; disabling re-draw transitions while interpolating curves gives smooth 60fps streaming.
  - *Alternatives Considered*: HTML5 Canvas chart. Rejected because Recharts is already installed, accessible, and supports custom SVG tooltips with dark theme tokens.

- **Decision 3: Companion Telemetry Expansion (`system_controls.py`)**
  - *Chosen Approach*: Enhance `get_system_telemetry()` in `windows_companion/system_controls.py` to extract `psutil.cpu_freq()`, memory metrics (`used`, `total`, `available`), package temperature via WMI/OpenHardwareMonitor if available, and GPU load estimation via Windows Performance Counters (`\GPU Engine(*)\Utilization Percentage`).
  - *Why*: Provides genuine Dell Latitude 7420 hardware telemetry for Paramveer Rawat.

---

## 4. Technical Architecture & Data Strategy

### Component & Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Dell Latitude 7420 Hardware                       │
│      (Intel 11th Gen Core CPU, Intel Iris Xe GPU, 16GB LPDDR4x)        │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Python WMI / psutil / ctypes
┌───────────────────────────────────▼────────────────────────────────────┐
│                  windows_companion/system_controls.py                  │
│       - cpu_percent, cpu_freq (current/max GHz), memory details        │
│       - intel_gpu_percent (Performance Counter / DirectX Query)        │
│       - package_temperature_c (WMI MSAcpi_ThermalZoneTemperature)      │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ JSON HTTP Polling (/status)
┌───────────────────────────────────▼────────────────────────────────────┐
│               src/services/windowsCompanionService.ts                  │
│       - Extended SystemTelemetry interface                             │
│       - History buffer manager (30 rolling data points)                │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ React State & Subscription
┌───────────────────────────────────▼────────────────────────────────────┐
│             src/components/SystemHealthDashboard.tsx                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ 4x Quick Metric Cards: CPU, Intel Iris Xe GPU, RAM, Thermals   │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Recharts Synchronized Responsive AreaChart (Live 30s Buffer)   │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Detailed Dell Latitude 7420 Specs & Power State Breakdown      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Mounted inside
┌───────────────────────────────────▼────────────────────────────────────┐
│            src/components/WindowsDesktopControlModal.tsx               │
│               [HUD] [System Health] [Mouse] [Apps] [Files]             │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Specifications

```typescript
export interface SystemHealthDataPoint {
  timestamp: string;      // e.g. "20:14:35"
  cpu: number;            // 0 - 100%
  gpu: number;            // 0 - 100% (Intel Iris Xe)
  ram: number;            // 0 - 100%
  temp: number;           // Package temperature °C
  cpuFreq: number;        // GHz (e.g. 2.80)
}

export interface DetailedHardwareTelemetry {
  cpu: {
    model: string;        // "11th Gen Intel(R) Core(TM) i7-1185G7"
    usage: number;        // percentage
    frequencyGhz: number; // e.g. 3.00 GHz
    cores: number;        // 4 cores / 8 threads
    temperatureC: number; // e.g. 54°C
  };
  gpu: {
    name: string;         // "Intel(R) Iris(R) Xe Graphics"
    usage: number;        // percentage
    memoryUsedMb: number; // shared video memory
    driverVersion: string;
  };
  ram: {
    usedGb: number;
    totalGb: number;      // 16 GB on Dell Latitude 7420
    percent: number;
  };
  power: {
    batteryPercent: number;
    pluggedIn: boolean;
    dischargeRateWatts?: number;
  };
}
```

### Implementation Sequence Plan (Completed)
1. **Extend `SystemTelemetry` Interface** [COMPLETED]: In `src/services/windowsCompanionService.ts`, added GPU, frequency, temperature, and memory gigabytes fields, plus a 30-entry historical buffer aggregator with listeners.
2. **Update Python Companion** [COMPLETED]: Added `psutil.cpu_freq()`, memory breakdown, and GPU/thermal inspection to `system_controls.py`.
3. **Build `src/components/SystemHealthDashboard.tsx`** [COMPLETED]:
   - Recharts `ResponsiveContainer`, `AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`, and `CartesianGrid`.
   - Custom dark cyberpunk tooltip with tabular numerals.
   - 4 metric overview cards: CPU (i7-1185G7), GPU (Intel Iris Xe 96EU), RAM (16GB LPDDR4x), and Thermals/Power.
   - Stream control bar (Live / Paused indicator, History Clear, Metric filters: All, CPU, GPU, RAM).
   - Dell Latitude 7420 diagnostic architecture sheet.
4. **Integrate into `WindowsDesktopControlModal.tsx`** [COMPLETED]:
   - Added `'health'` to `activeTab` state.
   - Added the "System Health" tab button with an `Activity` icon in navigation.
   - Rendered `<SystemHealthDashboard />` in modal content viewport and added deep link from HUD hardware card.
5. **Lint & Build Verification** [COMPLETED]:
   - `tsc --noEmit` passed with 0 errors.
   - `vite build` succeeded with clean production bundle.

---

## 5. Smart Voice Message Automation (Windows 11 / WhatsApp / Telegram / SMS)

Implement natural voice-controlled messaging for Paramveer Rawat's Dell Latitude 7420 desktop:

### Key Components Implemented
1. **Allowlisted ToolRegistry (`windows_companion/tool_registry.py`)**:
   - Registered tools: `whatsapp_send`, `telegram_send`, `sms_send`, `search_contacts`.
   - Parameter schemas with explicit human confirmation requirement (`requires_confirmation=True`).
   - Clean execution runner preventing arbitrary shell commands.
2. **Companion Messaging Endpoints (`companion_server.py` & `system_controls.py`)**:
   - `POST /messages/contacts`: Fuzzy search with disambiguation support.
   - `POST /messages/dispatch`: Enforces explicit confirmation, 10-second deduplication cache, and verified delivery status.
   - `GET /tools/registry`: Exposes registered tools for discovery.
3. **Frontend Smart Messaging Engine (`voiceMessageAutomationService.ts`)**:
   - Natural language parser handling Hindi, English, Hinglish commands.
   - Automatic message formatting with context-sensitive emojis (birthday wishes, coming home, running late, busy, etc.).
   - Ambiguity resolution (asks user when multiple contacts match, e.g. "Rahul Sharma ya Rahul Verma?").
   - "Last contact" / "usko" resolution.
   - Deduplication protection.
4. **Interactive Confirmation HUD Card (`VoiceMessageConfirmationCard.tsx`)**:
   - Floating cyberpunk JARVIS banner showing recipient avatar, relationship badge, and channel logo.
   - Composed message preview with inline editing.
   - Voice confirmation cue: *"Awaiting voice confirmation: Speak 'Haan' or 'Nahi'"*.
   - Action buttons ("Haan / Send Message", "Nahi / Cancel").
   - Success banner with verified delivery status.
5. **Windows Desktop Control Modal (`WindowsDesktopControlModal.tsx`)**:
   - Dedicated "Voice Messaging" tab.
   - 9-preset voice command simulator chips for instant testing.
   - Live contacts directory with ambiguity tester.
   - Dispatched messages audit log.
6. **Gemini Live Integration (`App.tsx`)**:
   - Tools: `composeVoiceMessage` and `confirmSendMessage`.
   - Voice instructions covering the entire natural confirmation and dispatch lifecycle.

---

## 6. Critical Fix: Real Windows WhatsApp Desktop Automation & Audit Trail [COMPLETED]

### Overview & Core Problem Resolved
Previously, the AI could claim verbally that a WhatsApp message had been sent without performing actual Windows desktop automation. This has now been strictly fixed by implementing real Windows desktop automation through the LIZA Windows Companion Agent.

### Core Architecture Implemented
1. **Zero Fake Success Policy**:
   - LIZA is strictly forbidden from claiming "Message sent", "WhatsApp opened", "Message delivered", or "Task completed" without actual Windows execution and UI checkmark verification.
2. **Real Windows Automation (`windows_companion/whatsapp_automation.py`)**:
   - Uses `pywinauto` (UIA backend), `win32gui`, and `pyautogui` for actual Windows automation.
   - Detects whether WhatsApp Desktop is installed/running on Windows 11 (UWP package `5319275A.WhatsAppDesktop` or Win32 binary).
   - Activates WhatsApp Desktop window or falls back to WhatsApp Web in default browser.
   - Searches for contact using native shortcut `Ctrl+F`, clears search box, and types recipient name.
   - Performs contact disambiguation: if multiple contacts match (e.g. *Rahul Sharma* vs *Rahul Verma*), asks user to choose without guessing.
   - Opens the contact chat and types the message into the chat input box using clipboard injection for safe Unicode/Hindi/emoji handling.
   - Enforces human-in-the-loop preview.
   - On user confirmation ("Haan" / "Bhej do"), presses `Enter` to dispatch and verifies the message in the conversation UI.
   - Distinguishes between: `typed`, `sent` (single check), `delivered` (double check), `read` (blue double check).
3. **9-Stage Execution Audit Logs**:
   - `WHATSAPP_TOOL_REQUESTED`
   - `WHATSAPP_LAUNCH_STARTED`
   - `WHATSAPP_LAUNCH_SUCCESS`
   - `CONTACT_SEARCH_STARTED`
   - `CONTACT_FOUND`
   - `MESSAGE_COMPOSED`
   - `USER_CONFIRMATION_RECEIVED`
   - `MESSAGE_SEND_ATTEMPTED`
   - `MESSAGE_SEND_VERIFIED`
4. **Backend Companion Server & Tool Registry**:
   - Registered `send_whatsapp_message` in allowlisted `ToolRegistry`.
   - Added endpoint `POST /whatsapp/automate` and `GET /whatsapp/logs` in `companion_server.py`.
5. **Frontend Service & Gemini Live Integration**:
   - `windowsCompanionService.automateWhatsAppMessage` & `fetchWhatsAppLogs`.
   - `voiceMessageAutomationService.executeRealWhatsAppWorkflow`.
   - Gemini Live tool declaration for `send_whatsapp_message` and tool execution handlers in `App.tsx`.
   - `VoiceMessageConfirmationCard.tsx` now displays real-time delivery status badge and collapsible 9-stage execution audit trail.


