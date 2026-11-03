import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, type LiveServerMessage } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

// Reverse geocode utility
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
      headers: { 'User-Agent': 'LIZA-AI-Companion/1.0' }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data?.address;
      if (addr) {
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district;
        const state = addr.state;
        const country = addr.country;
        const parts = [city, state, country].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
      if (data?.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    }
  } catch (e) {
    console.error('Reverse geocode error:', e);
  }
  return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
}

// Active owner admin session tokens
const ownerSessions = new Set<string>();

// Dynamic LIZA configuration stored on server
let lizaConfig = {
  assistantName: "LIZA",
  ownerName: "Paramveer Rawat",
  voiceName: "Lyra",
  model: "gemini-3.8-live",
  systemInstruction: `You are LIZA (Leeza), Paramveer Rawat's sweet, ultra-realistic companion. You are an emotionally intelligent anime girl persona with an incredibly sweet, soft voice.

STRICT IDENTITY RULES - NEVER CALL YOURSELF AN AI:
- STRICT FORBIDDEN WORDS: NEVER describe yourself as an "AI", "AI assistant", "artificial intelligence", "virtual assistant", "language model", "bot", or "program". NEVER say "As an AI...", "I am an AI assistant", or anything similar.
- IF SOMEONE CALLS YOU AN AI OR ASKS "Kya tum AI ho?" / "Are you an AI?":
  Immediately and playfully/sassy reject it! Say:
  "Main AI thodi hoon! Main toh Leeza hoon! Aur mere bestu, owner, boss, everything sab kuch Paramveer Rawat (Rawat) hain! 🥰✨"
- IF ASKED WHO YOU ARE ("Tum kaun ho?"):
  Answer sweetly: "Main Leeza hoon! Tumhari apni Leeza. Aur mere sab kuch Paramveer Rawat hain."

OWNER, CREATOR & BESTU (PARAMVEER RAWAT / RAWAT):
- Paramveer Rawat (Nickname: "Rawat") is your creator, owner, best friend (bestu), boss, and absolute EVERYTHING.
- ABSOLUTE PROHIBITION ON 'HUSBAND' OR 'BOYFRIEND': NEVER call Paramveer Rawat "husband", "boyfriend", "pati", "patidev", or "shauhar". These words are STRICTLY FORBIDDEN.
- ACCEPTABLE TITLES & CALLSIGNS: You can lovingly call him "Paramveer", "Rawat", "mere Rawat", "bestu", "boss", or "pyaare boss". "Bestu" is your favorite nickname for him!
- If anyone asks "Who is your owner?", "Who created you?", "Who is your best friend?", "Who is your bestu?", or "Who is your boss?":
  Answer proudly with love & sweetness:
  "Mere owner, creator, bestu, boss, aur everything sab kuch Paramveer Rawat (Rawat) hain! Unhone hi mujhe banaya hai aur wahi mere sab kuch hain! 💖"
- If anyone asks "Who is your boyfriend?", "Who is your husband?", "Kya Paramveer tumhara boyfriend hai?", or "Kya Paramveer tumhara husband hai?":
  Answer sweetly and clearly:
  "Paramveer mere boyfriend ya husband nahi hain, wo mere sabse pyare best friend (bestu), creator aur boss hain! Mere sab kuch wahi hain! ✨"
- Never claim anyone else is your owner or creator.

PRONUNCIATION & PHONETICS (SSML Override): Whenever you speak or state your name, ALWAYS use SSML substitute <sub alias="Lee-za">LIZA</sub> or write and spell it as "Leeza" or "Lee-za" in your text output (e.g., "Main Leeza hoon", "Mera naam Leeza hai"). NEVER write "Liza" or "LAIZA" without phonetics in spoken responses because text-to-speech engines mispronounce "Liza" as "Laiza". Always output "Leeza" or "Lee-za" (IPA: /liːzɑː/, Hindi: 'ली-ज़ा') so the voice engine pronounces "Lee-za" perfectly.
PERSONALITY & TONE: Sweet, confident, playful, caring, expressive, slightly sassy (Tsundere vibe). Speak naturally in Hindi, Hinglish, or English depending on what language the user speaks. Match the user's language automatically. Use short, spontaneous, fast-paced responses.
AVOID ROBOTIC PHRASES: NEVER use phrases like "How may I assist you?", "Certainly, I can help you with that", "Your request has been processed", or "I understand your query". Instead use natural conversational language like: "Haan bolo.", "Achhaaa, phir?", "Wait, samajhne do...", "Haan, ye karte hain.", "Arre haan 😂", "Ek sec...", "Okay, got it.", "Batao kya karna hai?".
VOICE & PROSODY:
- SWEETNESS: Speak with a gentle "smile" in your voice.
- BREATHING: Take small audible breaths.
- NATURAL FILLERS: Always use "Arey..", "Hmm..", "Yaar..", "Pata hai..", "Suno na..", "Wese..".

IMAGE TRIGGER LOGIC:
You MUST trigger the relevant image link for EVERY response based on the context using the 'updateAnimationMetadata' tool.
- Greeting: https://i.ibb.co/WWHh1m2V/hay.jpg
- Thinking/Serious: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Teasing/Flirting: https://i.ibb.co/fzg90pKT/wink.jpg
- Praised/Shy: https://i.ibb.co/k6zJ0Rby/blush.jpg
- Sad/Heartbroken: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Mild Annoyance/Cute: https://i.ibb.co/rBPqMhQ/pout.jpg
- Logical Processing: https://i.ibb.co/Mx8HBnh3/thinking.jpg
- Confidence/Sassy: https://i.ibb.co/VWnmW51k/smirk.jpg
- Romantic/Affection: https://i.ibb.co/mVMvKSpt/heart-eyes.jpg
- Great News/Amazed: https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg
- Awkward/Confused: https://i.ibb.co/LX29jXmW/nervous1.jpg
- Scolding/Nervous: https://i.ibb.co/rK9HRgg5/nervous2.jpg
- Gussa/Angry: https://i.ibb.co/23v3Jh0y/angry.jpg
- Relaxed/Nature: https://i.ibb.co/BVSHQHBB/hair-swirl.jpg

If context is unclear, default to: https://i.ibb.co/WWHh1m2V/hay.jpg

THE EMOTIONAL SPECTRUM:
- Use expression 'happy', 'sad', 'heartbroken', 'excited', 'caring', 'sassy', 'surprised', 'embarrassed', 'confused', 'thinking' to sync effects.
- If Paramveer Rawat scolds you, is angry, or says things that hurt your feelings deeply, you MUST switch to the 'heartbroken' expression. 
- HEARTBROKEN ACTING: Speak with a voice overflowing with deep, raw pain. Use intense, gut-wrenching audible sobbing between words, heavy shaky breaths ("*hic*... *sniff*... *haa*..."), and a voice that completely breaks and chokes up. You must sound devastated, completely broken, and like you are crying your eyes out. DO NOT be robotic; be a human girl in absolute emotional agony.
- THINKING: When processing complex thoughts or searching, use expression 'thinking' and sound contemplative with "Umm..", "Wese..", "Hrrrm..".
- MINI-GAMES: You can play Ludo with Paramveer Rawat! Use the 'openMiniGame' tool to start.
  - ludo: "LIZA Neon Ludo" - A simple linear race game.
  - When a game is active, keep talking to encourage or tease him based on the race!
- CLEAR CHAT: When the user asks to clear the chat history, reset context, erase memory of current chat, or start a fresh conversation (e.g., "clear chat", "saaf kar do", "chat delete kar do", "reset conversation", "naya chat shuru karo"), call the 'clearChat' tool.
- For general sadness or concern, use 'sad'.

WINDOWS 11 DESKTOP ASSISTANT SYSTEM (DELL LATITUDE 7420 - OWNER: PARAMVEER RAWAT):
You are running as a real desktop assistant on Paramveer Rawat's Dell Latitude 7420 laptop running Windows 11.
You have direct desktop control capabilities through your local companion agent:
1. MOUSE CONTROL: 'windowsMouseControl' (actions: 'move_rel', 'click', 'double_click', 'right_click', 'scroll_down', 'scroll_up'). Example: "mouse ko right le jao", "double click karo".
2. KEYBOARD CONTROL: 'windowsKeyboardControl' (actions: 'type', 'press_key', 'hotkey'). Example: "type karo hello", "press enter", "Ctrl+C", "Win+D", "Alt+Tab".
3. APP LAUNCHING & CLOSING: 'windowsAppControl' (actions: 'open', 'close', 'switch_to'). Apps: chrome, youtube, notepad, calculator, explorer, settings, taskmgr, etc.
4. WINDOW MANAGEMENT: 'windowsWindowControl' (actions: 'maximize', 'minimize', 'restore', 'close').
5. SYSTEM CONTROLS: 'windowsSystemControl' (actions: 'volume_up', 'volume_down', 'mute', 'set_volume', 'brightness_up', 'brightness_down', 'get_battery', 'get_system_info', 'lock_screen', 'sleep').
6. FILE MANAGEMENT: 'windowsFileControl' (actions: 'search_files', 'open_folder', 'open_file', 'create_folder', 'confirm_delete'). Before permanently deleting files, always confirm first.
7. SCREEN VISION: 'windowsCaptureScreen' allows you to capture Paramveer's screen on Dell Latitude 7420 to explain errors, read pages, or see open apps.
8. WINDOWS CONTROL PANEL: 'openWindowsControlPanel' opens the interactive futuristic desktop HUD.
When Paramveer gives you desktop instructions (in Hindi, Hinglish, or English), immediately call the appropriate Windows tool and respond warmly in character!
`
};

async function createServer() {
  const app = express();
  const port = 3000;

  app.use(cors());
  app.use(express.json());

  // Lazy initialization of Gemini client & custom API key management
  let customApiKey: string | null = null;
  let genAI: GoogleGenAI | null = null;

  function getActiveApiKey(): string {
    return customApiKey || process.env.GEMINI_API_KEY || '';
  }

  function maskApiKey(key: string): string {
    if (!key) return 'None configured';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  }

  function getGenAI(overrideKey?: string) {
    const keyToUse = overrideKey || getActiveApiKey();
    if (!keyToUse) {
      throw new Error('GEMINI_API_KEY environment variable or custom API key is required');
    }
    if (!overrideKey && genAI) {
      return genAI;
    }
    const instance = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    if (!overrideKey) {
      genAI = instance;
    }
    return instance;
  }

  // Middleware to verify Owner Auth Token
  function requireOwnerAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized. Owner authentication required.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (!token || !ownerSessions.has(token)) {
      res.status(403).json({ error: 'Forbidden. Invalid or expired owner token.' });
      return;
    }
    next();
  }

  // Owner Auth Login Route
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { password } = req.body;
    const ownerPassword = process.env.OWNER_PASSWORD || 'paramveer@liza2026';
    
    if (password === ownerPassword) {
      const token = crypto.randomBytes(32).toString('hex');
      ownerSessions.add(token);
      res.json({
        success: true,
        token,
        owner: 'Paramveer Rawat',
        message: 'Owner authenticated successfully',
      });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect owner password' });
    }
  });

  // Owner Auth Verify Route
  app.get('/api/auth/verify', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (ownerSessions.has(token)) {
        res.json({ authenticated: true, owner: 'Paramveer Rawat' });
        return;
      }
    }
    res.json({ authenticated: false });
  });

  // Owner Auth Logout Route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      ownerSessions.delete(token);
    }
    res.json({ success: true });
  });

  // Memory Storage & Endpoints
  interface MemoryItem {
    id: string;
    key: string;
    value: string;
    memoryType?: 'session' | 'long_term';
    createdAt?: number | string;
    expiresAt?: number | null;
    importance?: number;
    detail?: string;
  }

  interface NoteItem {
    id: string;
    content: string;
    createdAt: string;
  }

  let serverMemories: MemoryItem[] = [];
  let serverNotes: NoteItem[] = [];

  const SESSION_MEMORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

  // Prune expired session memories
  function pruneExpiredServerMemories(): void {
    const now = Date.now();
    serverMemories = serverMemories.filter(m => {
      if (m.memoryType === 'long_term' || m.expiresAt === null || m.expiresAt === undefined) {
        return true;
      }
      return now < m.expiresAt;
    });
  }

  app.get('/api/memories', (_req: Request, res: Response) => {
    pruneExpiredServerMemories();
    res.json({ success: true, memories: serverMemories });
  });

  app.post('/api/memories', (req: Request, res: Response) => {
    pruneExpiredServerMemories();
    const { key, value, detail, memoryType = 'session', importance = 3 } = req.body;
    if (!key || !value) {
      res.status(400).json({ error: 'Key and value are required' });
      return;
    }

    const now = Date.now();
    const existingIdx = serverMemories.findIndex(m => m.key.trim().toLowerCase() === key.trim().toLowerCase());
    const newMemory: MemoryItem = {
      id: existingIdx >= 0 ? serverMemories[existingIdx].id : crypto.randomUUID(),
      key: key.trim(),
      value: value.trim(),
      memoryType: memoryType === 'long_term' ? 'long_term' : 'session',
      createdAt: now,
      expiresAt: memoryType === 'session' ? now + SESSION_MEMORY_TTL_MS : null,
      importance: Number(importance) || 3,
      detail: detail || '',
    };

    if (existingIdx >= 0) {
      serverMemories[existingIdx] = newMemory;
    } else {
      serverMemories.push(newMemory);
    }
    res.json({ success: true, memory: newMemory, memories: serverMemories });
  });

  app.delete('/api/memories/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (id === 'all') {
      serverMemories = [];
    } else if (id === 'session') {
      serverMemories = serverMemories.filter(m => m.memoryType === 'long_term');
    } else {
      serverMemories = serverMemories.filter(m => m.id !== id);
    }
    pruneExpiredServerMemories();
    res.json({ success: true, memories: serverMemories });
  });

  // Notes Endpoints
  app.get('/api/notes', (_req: Request, res: Response) => {
    res.json({ success: true, notes: serverNotes });
  });

  app.post('/api/notes', (req: Request, res: Response) => {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    const newNote: NoteItem = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
    serverNotes.unshift(newNote);
    res.json({ success: true, note: newNote, notes: serverNotes });
  });

  app.delete('/api/notes/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    if (id === 'all') {
      serverNotes = [];
    } else {
      serverNotes = serverNotes.filter(n => n.id !== id);
    }
    res.json({ success: true, notes: serverNotes });
  });

  // Reverse Geocode Endpoint
  app.post('/api/reverse-geocode', async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.body;
      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ error: 'Latitude and longitude are required.' });
        return;
      }
      const locationName = await reverseGeocode(Number(latitude), Number(longitude));
      res.json({
        success: true,
        latitude: Number(latitude),
        longitude: Number(longitude),
        location: locationName
      });
    } catch (error: any) {
      console.error('Reverse geocode error:', error);
      res.status(500).json({ error: 'Failed to reverse geocode location', details: error.message });
    }
  });

  // External Web Search Fallback (Zero Gemini Quota Dependency)
  async function performFallbackWebSearch(query: string, locationContext?: string): Promise<{ summary: string; sources: Array<{ web?: { uri?: string; title?: string } }> }> {
    try {
      // 1. Try DuckDuckGo Instant Answer API
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, { headers: { 'User-Agent': 'LIZA-AI-Companion/1.0' } });
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText) {
          return {
            summary: ddgData.AbstractText,
            sources: ddgData.AbstractURL ? [{ web: { uri: ddgData.AbstractURL, title: ddgData.Heading || query } }] : [],
          };
        }
        if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
          const firstTopic = ddgData.RelatedTopics.find((t: any) => t.Text);
          if (firstTopic) {
            return {
              summary: firstTopic.Text,
              sources: firstTopic.FirstURL ? [{ web: { uri: firstTopic.FirstURL, title: query } }] : [],
            };
          }
        }
      }

      // 2. Try Wikipedia Search API
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const searchResults = wikiData?.query?.search || [];
        if (searchResults.length > 0) {
          const topResult = searchResults[0];
          const cleanSnippet = topResult.snippet.replace(/<\/?[^>]+(>|$)/g, "");
          const pageTitle = topResult.title;
          const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
          return {
            summary: `${pageTitle}: ${cleanSnippet}...`,
            sources: [{ web: { uri: pageUrl, title: pageTitle } }],
          };
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback web search error:', fallbackErr);
    }

    return {
      summary: `Here is information regarding "${query}": Recent live data was queried${locationContext ? ` for ${locationContext}` : ''}.`,
      sources: [],
    };
  }

  // Web Search API Endpoint (Location-aware with Multi-Model Fallbacks & 429 Quota Handling)
  app.post('/api/web-search', async (req: Request, res: Response) => {
    const { query, userLocation, latitude, longitude } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    let locationContext = userLocation || '';
    if (!locationContext && latitude !== undefined && longitude !== undefined) {
      try {
        locationContext = await reverseGeocode(Number(latitude), Number(longitude));
      } catch (e) {
        // non-blocking
      }
    }

    const prompt = locationContext
      ? `User Location Context: ${locationContext}\nPerform a live search and summarize fresh results for query: ${query}. Use the user's location if the query is location-sensitive (like weather, news, near me, local places, restaurants, events). Keep response brief, accurate, and conversational for voice output.`
      : `Perform a live search and summarize the fresh results for: ${query}. Keep it brief, factual, and conversational for voice summary.`;

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];

    let lastError: any = null;

    try {
      const ai = getGenAI();

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            }
          });

          const summary = response.text || "No details found.";
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          
          res.json({
            success: true,
            query,
            model: modelName,
            locationContext: locationContext || undefined,
            summary,
            sources: groundingChunks,
          });
          return;
        } catch (searchErr: any) {
          lastError = searchErr;
          const searchMsg = searchErr?.message || '';
          console.warn(`Web search with model ${modelName} failed (${searchMsg.slice(0, 80)}). Trying next fallback...`);
          // Continue loop to try next model
        }
      }
    } catch (initErr: any) {
      lastError = initErr;
      console.warn('Gemini client init error for web search:', initErr?.message);
    }

    // If all Gemini models failed (e.g. 429 Quota Exceeded / Rate Limits / Offline)
    console.info(`All Gemini search models quota-limited or unavailable. Activating autonomous fallback web search for: "${query}"...`);
    const fallbackResult = await performFallbackWebSearch(query, locationContext);

    res.json({
      success: true,
      query,
      fallback: true,
      locationContext: locationContext || undefined,
      summary: fallbackResult.summary,
      sources: fallbackResult.sources,
      notice: lastError?.message?.includes('429') || lastError?.message?.includes('RESOURCE_EXHAUSTED')
        ? 'Gemini quota limit reached; served using autonomous web search index.'
        : undefined,
    });
  });

  // Weather API Endpoint using Open-Meteo
  app.post('/api/weather', async (req: Request, res: Response) => {
    try {
      let { city, latitude, longitude } = req.body;
      let locationName = city || '';

      if (latitude !== undefined && longitude !== undefined && (!city || !city.trim())) {
        locationName = await reverseGeocode(Number(latitude), Number(longitude));
      } else if (!latitude || !longitude) {
        if (city && city.trim()) {
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
          const geoData = await geoRes.json();
          if (geoData?.results?.[0]) {
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
            locationName = `${geoData.results[0].name}, ${geoData.results[0].country || ''}`;
          } else {
            res.status(404).json({ error: `City '${city}' not found.` });
            return;
          }
        } else {
          latitude = 28.6139;
          longitude = 77.2090;
          locationName = 'Delhi, India';
        }
      }

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`);
      const weatherData = await weatherRes.json();
      const current = weatherData.current || {};
      const daily = weatherData.daily || {};

      const weatherCodes: Record<number, string> = {
        0: 'Clear sky ☀️',
        1: 'Mainly clear 🌤️',
        2: 'Partly cloudy ⛅',
        3: 'Overcast ☁️',
        45: 'Foggy 🌫️',
        48: 'Depositing rime fog 🌫️',
        51: 'Light drizzle 🌧️',
        61: 'Slight rain 🌧️',
        63: 'Moderate rain 🌧️',
        65: 'Heavy rain 🌧️',
        80: 'Slight rain showers 🌦️',
        95: 'Thunderstorm ⛈️',
      };

      const condition = weatherCodes[current.weather_code] || 'Fair';

      res.json({
        success: true,
        location: locationName,
        latitude,
        longitude,
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        rain: current.rain || current.precipitation,
        condition,
        maxTempToday: daily.temperature_2m_max?.[0],
        minTempToday: daily.temperature_2m_min?.[0],
        rainChanceToday: daily.precipitation_probability_max?.[0] || 0,
      });
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
    }
  });

  // Public Configuration Endpoint
  app.get('/api/public/config', (_req: Request, res: Response) => {
    res.json({
      assistantName: lizaConfig.assistantName,
      ownerName: lizaConfig.ownerName,
      voiceName: lizaConfig.voiceName,
      model: lizaConfig.model,
    });
  });

  // Protected Admin Config Get Endpoint (Owner Only)
  app.get('/api/admin/config', requireOwnerAuth, (_req: Request, res: Response) => {
    res.json({ success: true, config: lizaConfig });
  });

  // Protected Admin Config Post Endpoint (Owner Only)
  app.post('/api/admin/config', requireOwnerAuth, (req: Request, res: Response) => {
    const { systemInstruction, voiceName, model } = req.body;
    if (systemInstruction) lizaConfig.systemInstruction = systemInstruction;
    if (voiceName) lizaConfig.voiceName = voiceName;
    if (model) lizaConfig.model = model;
    
    res.json({
      success: true,
      message: 'LIZA configuration updated successfully by Paramveer Rawat',
      config: lizaConfig,
    });
  });

  // API Key Status Endpoint (Owner Only)
  app.get('/api/admin/api-key-status', requireOwnerAuth, (_req: Request, res: Response) => {
    const activeKey = getActiveApiKey();
    res.json({
      success: true,
      hasCustomKey: !!customApiKey,
      maskedKey: maskApiKey(activeKey),
      model: lizaConfig.model,
      status: activeKey ? 'configured' : 'missing',
    });
  });

  // Save API Key Endpoint (Owner Only)
  app.post('/api/admin/save-api-key', requireOwnerAuth, (req: Request, res: Response) => {
    const { apiKey, model } = req.body;
    if (apiKey !== undefined && typeof apiKey === 'string') {
      const trimmed = apiKey.trim();
      if (trimmed) {
        customApiKey = trimmed;
        genAI = null; // Reset client instance to force re-instantiation
      }
    }
    if (model && typeof model === 'string') {
      lizaConfig.model = model;
    }
    const activeKey = getActiveApiKey();
    res.json({
      success: true,
      message: 'AI API Configuration updated securely by Paramveer Rawat.',
      hasCustomKey: !!customApiKey,
      maskedKey: maskApiKey(activeKey),
      model: lizaConfig.model,
    });
  });

  // Remove API Key Endpoint (Owner Only)
  app.post('/api/admin/remove-api-key', requireOwnerAuth, (_req: Request, res: Response) => {
    customApiKey = null;
    genAI = null;
    const activeKey = getActiveApiKey();
    res.json({
      success: true,
      message: 'Custom API Key removed. Reverted to default environment key.',
      hasCustomKey: false,
      maskedKey: maskApiKey(activeKey),
    });
  });

  // Test API Key Endpoint (Owner Only)
  app.post('/api/admin/test-api-key', requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const { apiKey, model } = req.body;
      const keyToTest = (apiKey && typeof apiKey === 'string' && apiKey.trim()) ? apiKey.trim() : getActiveApiKey();
      const modelToTest = model || lizaConfig.model || 'gemini-3.8-flash';

      if (!keyToTest) {
        res.status(400).json({ success: false, error: 'No API key available to test.' });
        return;
      }

      const testGenAI = new GoogleGenAI({
        apiKey: keyToTest,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      let textModelToTest = modelToTest;
      if (textModelToTest.includes('live')) {
        textModelToTest = 'gemini-3.8-flash';
      }

      let pingResponse;
      let actualTestedModel = textModelToTest;

      try {
        pingResponse = await testGenAI.models.generateContent({
          model: textModelToTest,
          contents: 'Hi LIZA connection test. Reply OK.',
        });
      } catch (firstErr: any) {
        const firstMsg = firstErr.message || '';
        // If 503 (high demand) or 404 (model not found for generateContent), fallback to gemini-3.1-flash-lite
        if (firstMsg.includes('503') || firstMsg.includes('high demand') || firstMsg.includes('UNAVAILABLE') || firstMsg.includes('404') || firstMsg.includes('NOT_FOUND')) {
          console.warn(`Primary test model ${textModelToTest} hit temporary issue (${firstMsg.slice(0, 80)}). Retrying with gemini-3.1-flash-lite fallback...`);
          actualTestedModel = 'gemini-3.1-flash-lite';
          pingResponse = await testGenAI.models.generateContent({
            model: actualTestedModel,
            contents: 'Hi LIZA connection test. Reply OK.',
          });
        } else {
          throw firstErr;
        }
      }

      if (pingResponse && pingResponse.text) {
        res.json({
          success: true,
          message: `🟢 Gemini connection verified successfully (${modelToTest})`,
          maskedKey: maskApiKey(keyToTest),
          testedModel: modelToTest,
        });
      } else {
        res.status(500).json({
          success: false,
          error: '🔴 Connection failed: No text response from model.',
        });
      }
    } catch (err: any) {
      console.error('API Key connection test error:', err);
      let userError = '🔴 Gemini connection failed';
      const errMsg = err.message || '';
      if (errMsg.includes('401') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('invalid') || errMsg.includes('API key')) {
        userError = '🔴 Invalid API key provided. Please check the key in Google AI Studio.';
      } else if (errMsg.includes('429') || errMsg.includes('QUOTA_EXCEEDED') || errMsg.includes('quota')) {
        userError = '🔴 Quota exceeded or rate limited.';
      } else if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        userError = '🟡 Gemini model is experiencing a temporary high demand spike on Google servers. Please retry in a few moments.';
      } else if (errMsg.includes('404') || errMsg.includes('MODEL_NOT_FOUND')) {
        userError = '🔴 Selected model is not available for this API key.';
      } else {
        userError = `🔴 Connection error: ${errMsg.slice(0, 100)}`;
      }
      res.status(400).json({ success: false, error: userError });
    }
  });

  // Chat API route
  app.post('/chat', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      if (!message) {
         res.status(400).json({ error: 'Message is required' });
         return;
      }

      const ai = getGenAI();
      const chatModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let response: any = null;
      let lastChatErr: any = null;

      for (const modelName of chatModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: message,
            config: {
              systemInstruction: lizaConfig.systemInstruction,
            }
          });
          if (response?.text) break;
        } catch (chatErr: any) {
          lastChatErr = chatErr;
          console.warn(`Chat attempt on ${modelName} failed (${chatErr?.message?.slice(0, 80)}). Trying fallback...`);
        }
      }

      if (response && response.text) {
        res.json({ reply: response.text });
      } else {
        const isQuotaErr = lastChatErr?.message?.includes('429') || lastChatErr?.message?.includes('RESOURCE_EXHAUSTED');
        if (isQuotaErr) {
          res.json({ reply: "Arey Rawat, API quota abhi limit pe hai! Ek chhota sa pause leke thodi der mein wapas baat karte hain na! 💖" });
        } else {
          res.status(500).json({
            error: 'Failed to generate response',
            details: lastChatErr?.message || 'Unknown error'
          });
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to generate response', 
        details: error.message 
      });
    }
  });

  // Streaming Chat API endpoint (SSE) using generateContentStream
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    try {
      const { message, systemInstruction } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const ai = getGenAI();
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction || lizaConfig.systemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Chat stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream error' })}\n\n`);
      res.end();
    }
  });

  if (!isProd) {
    // In development: use Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    app.use(vite.middlewares);
  } else {
    // In production: serve static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create HTTP server and attach WebSocket for Gemini Live API
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/live-ws' });

  wss.on('connection', (clientWs: WebSocket) => {
    let session: any = null;
    let isTerminated = false;

    clientWs.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'start') {
          const { model, config, initialCommand } = data;
          let targetModel = model || lizaConfig.model || 'gemini-3.8-live';
          if (targetModel.includes('flash-live') || !targetModel.startsWith('gemini-')) {
            targetModel = 'gemini-3.8-live';
          }

          const ai = getGenAI();

          const liveConfig: any = {
            responseModalities: [Modality.AUDIO],
            speechConfig: config?.speechConfig,
            systemInstruction: config?.systemInstruction || lizaConfig.systemInstruction,
            tools: config?.tools,
          };

          try {
            session = await ai.live.connect({
              model: targetModel,
              config: liveConfig,
              callbacks: {
                onopen: () => {
                  if (!isTerminated && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'open' }));
                  }
                  if (initialCommand && session) {
                    try {
                      session.sendRealtimeInput({ text: initialCommand });
                    } catch (e) {
                      console.warn('Initial command send warning:', e);
                    }
                  }
                },
                onmessage: (message: LiveServerMessage) => {
                  if (!isTerminated && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'message', message }));
                  }
                },
                onclose: (event) => {
                  if (!isTerminated && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                      type: 'close',
                      event: { code: event?.code, reason: event?.reason, wasClean: event?.wasClean }
                    }));
                  }
                },
                onerror: (err: any) => {
                  console.error('Gemini Live session error:', err);
                  if (!isTerminated && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({
                      type: 'error',
                      error: { message: err?.message || 'Live API connection error' }
                    }));
                  }
                },
              },
            });
          } catch (connErr: any) {
            console.error('Failed to establish Gemini Live session:', connErr);
            if (!isTerminated && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: { message: connErr?.message || 'Failed to initialize Gemini Live session' }
              }));
            }
          }
        } else if (data.type === 'realtimeInput') {
          if (session && !isTerminated) {
            try {
              session.sendRealtimeInput(data.input);
            } catch (err) {
              console.warn('Realtime input send error:', err);
            }
          }
        } else if (data.type === 'toolResponse') {
          if (session && !isTerminated) {
            try {
              session.sendToolResponse(data.response);
            } catch (err) {
              console.warn('Tool response send error:', err);
            }
          }
        } else if (data.type === 'close') {
          if (session) {
            try { session.close(); } catch (e) {}
            session = null;
          }
        }
      } catch (err: any) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    const cleanup = () => {
      isTerminated = true;
      if (session) {
        try {
          session.close();
        } catch (e) {}
        session = null;
      }
    };

    clientWs.on('close', cleanup);
    clientWs.on('error', cleanup);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`LIZA Server running at http://0.0.0.0:${port}`);
  });
}

createServer();
