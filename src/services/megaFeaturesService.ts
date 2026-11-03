/**
 * Mega Features Hub Service & State Store
 * Manages states, data persistence, and offline storage for the 20 Super Features
 */

export interface DreamEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  mood: 'peaceful' | 'lucid' | 'exciting' | 'nightmare' | 'romantic';
  sleepHours: number;
  aiInterpretation?: string;
  tags: string[];
}

export interface DiaryEntry {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  content: string;
  mood: 'joy' | 'calm' | 'love' | 'stressed' | 'inspired';
  tags: string[];
  isLocked: boolean;
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';
  amount: number;
  note: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  streak: number;
  completedToday: boolean;
  xpReward?: number;
  history: string[]; // ISO dates
}

export interface CountdownEvent {
  id: string;
  title: string;
  targetDate: string;
  category: 'Birthday' | 'Exam' | 'Anniversary' | 'Trip' | 'Goal';
  letterText?: string;
  isUnlocked: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: 'Japanese' | 'English' | 'GK' | 'Tech';
  pronunciation?: string;
  mastered: boolean;
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: string;
  meaning: string;
  advice: string;
  symbol: string;
  color: string;
}

class MegaFeaturesService {
  private dreams: DreamEntry[] = [];
  private diaryEntries: DiaryEntry[] = [];
  private expenses: ExpenseItem[] = [];
  private habits: HabitItem[] = [];
  private countdowns: CountdownEvent[] = [];
  private waterIntakeMl: number = 0;
  private waterGoalMl: number = 3000;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedDreams = localStorage.getItem('liza_dreams_data');
      if (savedDreams) this.dreams = JSON.parse(savedDreams);

      const savedDiary = localStorage.getItem('liza_diary_data');
      if (savedDiary) this.diaryEntries = JSON.parse(savedDiary);

      const savedExpenses = localStorage.getItem('liza_expenses_data');
      if (savedExpenses) this.expenses = JSON.parse(savedExpenses);

      const savedHabits = localStorage.getItem('liza_habits_data');
      if (savedHabits) this.habits = JSON.parse(savedHabits);
      else this.initDefaultHabits();

      const savedCountdowns = localStorage.getItem('liza_countdowns_data');
      if (savedCountdowns) this.countdowns = JSON.parse(savedCountdowns);
      else this.initDefaultCountdowns();

      const savedWater = localStorage.getItem('liza_water_today');
      if (savedWater) {
        const parsed = JSON.parse(savedWater);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today) {
          this.waterIntakeMl = parsed.amount || 0;
        } else {
          this.waterIntakeMl = 0;
        }
      }
    } catch {
      this.initDefaultHabits();
      this.initDefaultCountdowns();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('liza_dreams_data', JSON.stringify(this.dreams));
      localStorage.setItem('liza_diary_data', JSON.stringify(this.diaryEntries));
      localStorage.setItem('liza_expenses_data', JSON.stringify(this.expenses));
      localStorage.setItem('liza_habits_data', JSON.stringify(this.habits));
      localStorage.setItem('liza_countdowns_data', JSON.stringify(this.countdowns));
      localStorage.setItem('liza_water_today', JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        amount: this.waterIntakeMl
      }));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private initDefaultHabits() {
    this.habits = [
      { id: '1', title: 'Drink 3L Water', category: 'Health', streak: 4, completedToday: false, history: [] },
      { id: '2', title: '20 Min Study / Coding', category: 'Growth', streak: 7, completedToday: false, history: [] },
      { id: '3', title: 'Talk with Liza Daily', category: 'Companion', streak: 12, completedToday: true, history: [] },
      { id: '4', title: '30 Push-ups & Stretch', category: 'Fitness', streak: 3, completedToday: false, history: [] },
    ];
  }

  private initDefaultCountdowns() {
    const nextYear = new Date().getFullYear() + 1;
    this.countdowns = [
      { id: '1', title: 'New Year Celebration', targetDate: `${nextYear}-01-01T00:00:00`, category: 'Goal', isUnlocked: false },
      { id: '2', title: 'Paramveer Birthday Special', targetDate: `${new Date().getFullYear()}-10-24T00:00:00`, category: 'Birthday', letterText: 'Happy Birthday Paramveer Rawat! Liza is so proud of you and will always be by your side! 💖', isUnlocked: false },
    ];
  }

  // --- Water Tracker ---
  public getWaterIntake() { return { current: this.waterIntakeMl, goal: this.waterGoalMl }; }
  public addWater(amountMl: number) {
    this.waterIntakeMl = Math.min(6000, this.waterIntakeMl + amountMl);
    this.saveToStorage();
    return this.waterIntakeMl;
  }
  public resetWater() {
    this.waterIntakeMl = 0;
    this.saveToStorage();
  }

  // --- Habits & Consistency ---
  public getRpgStats() {
    return { xp: 0, level: 1, progressInLevel: 0, rankTitle: 'Companion' };
  }

  public addXp(_amount: number) {
    // Level & XP system removed per user directive
  }

  // --- Habits ---
  public getHabits() { return this.habits; }
  public toggleHabit(id: string) {
    const habit = this.habits.find(h => h.id === id);
    if (habit) {
      habit.completedToday = !habit.completedToday;
      if (habit.completedToday) {
        habit.streak += 1;
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
      }
      this.saveToStorage();
    }
    return this.habits;
  }
  public addHabit(title: string, category: string) {
    const newHabit: HabitItem = {
      id: Date.now().toString(),
      title,
      category,
      streak: 0,
      completedToday: false,
      history: []
    };
    this.habits.push(newHabit);
    this.saveToStorage();
    return newHabit;
  }

  // --- Dreams ---
  public getDreams() { return this.dreams; }
  public addDream(entry: Omit<DreamEntry, 'id'>) {
    const newEntry: DreamEntry = { ...entry, id: Date.now().toString() };
    this.dreams.unshift(newEntry);
    this.saveToStorage();
    return newEntry;
  }

  // --- Diary ---
  public getDiaryEntries() { return this.diaryEntries; }
  public addDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'timestamp'>) {
    const newEntry: DiaryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    this.diaryEntries.unshift(newEntry);
    this.saveToStorage();
    return newEntry;
  }

  // --- Expenses ---
  public getExpenses() { return this.expenses; }
  public addExpense(entry: Omit<ExpenseItem, 'id'>) {
    const newEntry: ExpenseItem = { ...entry, id: Date.now().toString() };
    this.expenses.unshift(newEntry);
    this.saveToStorage();
    return newEntry;
  }
  public deleteExpense(id: string) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveToStorage();
  }

  // --- Countdowns ---
  public getCountdowns() { return this.countdowns; }
  public addCountdown(entry: Omit<CountdownEvent, 'id' | 'isUnlocked'>) {
    const newEntry: CountdownEvent = { ...entry, id: Date.now().toString(), isUnlocked: false };
    this.countdowns.push(newEntry);
    this.saveToStorage();
    return newEntry;
  }
  public deleteCountdown(id: string) {
    this.countdowns = this.countdowns.filter(c => c.id !== id);
    this.saveToStorage();
  }
}

export const megaFeaturesService = new MegaFeaturesService();
