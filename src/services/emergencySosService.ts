// Service 9: 1-Tap Emergency SOS & Live GPS Beacon

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SosBeaconState {
  isArmed: boolean;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  googleMapsUrl: string;
  emergencyContacts: EmergencyContact[];
  countdownSec: number;
}

const STORAGE_KEY = 'liza_emergency_sos_v1';

class EmergencySosService {
  private state: SosBeaconState = {
    isArmed: true,
    isActive: false,
    latitude: null,
    longitude: null,
    accuracyMeters: null,
    googleMapsUrl: '',
    emergencyContacts: [
      { id: '1', name: 'Family / Home', phone: '+919876543210', relationship: 'Primary' },
      { id: '2', name: 'Police / Emergency Control', phone: '112', relationship: 'Official' }
    ],
    countdownSec: 0
  };

  private listeners: Set<() => void> = new Set();
  private audioAlarm: HTMLAudioElement | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.state.emergencyContacts = parsed.emergencyContacts || this.state.emergencyContacts;
        } catch {}
      }
    }
  }

  public getState(): SosBeaconState {
    return { ...this.state };
  }

  public async fetchLiveGpsCoordinates(): Promise<{ lat: number; lng: number; url: string }> {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            this.state.latitude = lat;
            this.state.longitude = lng;
            this.state.accuracyMeters = Math.round(pos.coords.accuracy);
            this.state.googleMapsUrl = url;
            this.notify();
            resolve({ lat, lng, url });
          },
          () => {
            // Simulated default location for safety demo
            const lat = 28.6139;
            const lng = 77.2090;
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            this.state.latitude = lat;
            this.state.longitude = lng;
            this.state.accuracyMeters = 10;
            this.state.googleMapsUrl = url;
            this.notify();
            resolve({ lat, lng, url });
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        const lat = 28.6139;
        const lng = 77.2090;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        resolve({ lat, lng, url });
      }
    });
  }

  public triggerSosBroadcast(customMessage?: string) {
    this.state.isActive = true;
    this.fetchLiveGpsCoordinates();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 300, 200, 600, 200, 600]);
      } catch {}
    }

    const contactsList = this.state.emergencyContacts.map(c => c.phone).join(',');
    const mapsLink = this.state.googleMapsUrl || 'https://maps.google.com';
    const text = encodeURIComponent(
      `🚨 EMERGENCY SOS ALERT! 🚨\nParamveer Rawat needs urgent help.\n📍 Live Location: ${mapsLink}\n🕒 Time: ${new Date().toLocaleTimeString()}\n${customMessage || 'Please reach out immediately!'}`
    );

    // Deep link emergency SMS / WhatsApp
    const primaryPhone = this.state.emergencyContacts[0]?.phone?.replace(/[^0-9]/g, '') || '';
    if (primaryPhone && typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?phone=${primaryPhone}&text=${text}`, '_blank');
    }

    this.notify();
  }

  public cancelSos() {
    this.state.isActive = false;
    this.notify();
  }

  public addContact(contact: Omit<EmergencyContact, 'id'>) {
    this.state.emergencyContacts.push({
      ...contact,
      id: `c_${Date.now()}`
    });
    this.save();
    this.notify();
  }

  public removeContact(id: string) {
    this.state.emergencyContacts = this.state.emergencyContacts.filter(c => c.id !== id);
    this.save();
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ emergencyContacts: this.state.emergencyContacts }));
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const emergencySosService = new EmergencySosService();
