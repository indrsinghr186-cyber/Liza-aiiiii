// LIZA Smart Contacts & Relationship Matcher Service

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship?: string; // e.g. "Mummy", "Papa", "Brother", "Boss", "Friend"
  aliases: string[];     // ["Mummy", "Maa", "Mother", "Sunita"]
  lastContacted?: number;
  avatarColor?: string;
  notes?: string;
}

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Mummy (Sunita Rawat)',
    phone: '+91 98765 43210',
    relationship: 'Mother',
    aliases: ['mummy', 'maa', 'mom', 'mother', 'mataji'],
    avatarColor: 'from-pink-500 to-rose-600',
    notes: 'Home'
  },
  {
    id: 'c2',
    name: 'Papa (Rajesh Rawat)',
    phone: '+91 98765 43211',
    relationship: 'Father',
    aliases: ['papa', 'dad', 'father', 'pitaji', 'daddy'],
    avatarColor: 'from-blue-500 to-indigo-600',
    notes: 'Office / Home'
  },
  {
    id: 'c3',
    name: 'Aman (Bhai)',
    phone: '+91 98765 43212',
    relationship: 'Brother',
    aliases: ['aman', 'bhai', 'brother', 'bhaiya', 'bro'],
    avatarColor: 'from-emerald-500 to-teal-600',
    notes: 'College'
  },
  {
    id: 'c4',
    name: 'Priya (Didi)',
    phone: '+91 98765 43213',
    relationship: 'Sister',
    aliases: ['priya', 'didi', 'sister', 'behan', 'sis'],
    avatarColor: 'from-purple-500 to-violet-600'
  },
  {
    id: 'c5',
    name: 'Rahul Sharma (Best Friend)',
    phone: '+91 98765 43214',
    relationship: 'Friend',
    aliases: ['rahul', 'dost', 'friend', 'bestie', 'yaar'],
    avatarColor: 'from-amber-500 to-orange-600'
  },
  {
    id: 'c6',
    name: 'Rohit Verma (Boss)',
    phone: '+91 98765 43215',
    relationship: 'Boss',
    aliases: ['boss', 'manager', 'rohit', 'sir'],
    avatarColor: 'from-slate-600 to-slate-800'
  },
  {
    id: 'c7',
    name: 'Dr. Neha Kapoor',
    phone: '+91 98765 43216',
    relationship: 'Doctor',
    aliases: ['doctor', 'dr neha', 'clinic', 'physician'],
    avatarColor: 'from-cyan-500 to-blue-600'
  }
];

const STORAGE_KEY = 'liza_smart_contacts_v1';

class SmartContactsManager {
  private contacts: Contact[] = [];

  constructor() {
    this.loadContacts();
  }

  private loadContacts() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.contacts = JSON.parse(saved);
          return;
        } catch {
          // fallback
        }
      }
    }
    this.contacts = [...DEFAULT_CONTACTS];
    this.saveContacts();
  }

  private saveContacts() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.contacts));
    }
  }

  public getAll(): Contact[] {
    return [...this.contacts];
  }

  public getAllContacts(): Contact[] {
    return [...this.contacts];
  }

  public addContact(contact: {
    name: string;
    phone?: string;
    phoneNumber?: string;
    relationship?: string;
    aliases?: string[];
    avatarColor?: string;
    notes?: string;
  }): Contact {
    const rawPhone = contact.phone || contact.phoneNumber || '';
    const aliases = contact.aliases && contact.aliases.length > 0 
      ? contact.aliases 
      : [contact.name.toLowerCase(), ...(contact.relationship ? [contact.relationship.toLowerCase()] : [])];

    const newContact: Contact = {
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: contact.name,
      phone: rawPhone,
      relationship: contact.relationship,
      aliases,
      avatarColor: contact.avatarColor || 'from-indigo-500 to-purple-600',
      notes: contact.notes
    };
    this.contacts.unshift(newContact);
    this.saveContacts();
    return newContact;
  }


  public deleteContact(id: string): boolean {
    const initial = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    if (this.contacts.length !== initial) {
      this.saveContacts();
      return true;
    }
    return false;
  }

  /**
   * Fuzzy matches query against Name, Relationship, and Aliases
   */
  public findContact(query: string): { contact: Contact | null; matchType: 'exact' | 'alias' | 'fuzzy' | 'none'; confidence: number } {
    if (!query) return { contact: null, matchType: 'none', confidence: 0 };
    const q = query.trim().toLowerCase();

    // 1. Direct alias match
    for (const c of this.contacts) {
      if (c.aliases.some(a => a.toLowerCase() === q || q.includes(a.toLowerCase()))) {
        return { contact: c, matchType: 'alias', confidence: 0.98 };
      }
    }

    // 2. Direct name match
    for (const c of this.contacts) {
      if (c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase())) {
        return { contact: c, matchType: 'exact', confidence: 0.95 };
      }
    }

    // 3. Relationship match
    for (const c of this.contacts) {
      if (c.relationship && (c.relationship.toLowerCase() === q || q.includes(c.relationship.toLowerCase()))) {
        return { contact: c, matchType: 'alias', confidence: 0.92 };
      }
    }

    // 4. Fuzzy word overlap
    for (const c of this.contacts) {
      const words = c.name.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 2 && q.includes(w))) {
        return { contact: c, matchType: 'fuzzy', confidence: 0.75 };
      }
    }

    return { contact: null, matchType: 'none', confidence: 0 };
  }
}

export const smartContactsService = new SmartContactsManager();
