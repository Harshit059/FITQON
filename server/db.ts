import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, WorkoutLog, DietLog, HealthReport } from '../src/types';

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel
  ? path.join('/tmp', 'data')
  : path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Copy default seed json files over from process.cwd()/data to /tmp/data if on Vercel to preserve demo accounts
if (isVercel) {
  const originalDataDir = path.join(process.cwd(), 'data');
  if (fs.existsSync(originalDataDir)) {
    try {
      const files = fs.readdirSync(originalDataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const srcPath = path.join(originalDataDir, file);
          const destPath = path.join(DATA_DIR, file);
          if (!fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    } catch (err) {
      console.error('Failed to copy seeding data to /tmp/data in Vercel environment:', err);
    }
  }
}

// Simple JSON File Collection wrapper
class LocalCollection<T extends { id: string }> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private read(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err);
      return [];
    }
  }

  private write(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Error writing ${this.filePath}:`, err);
    }
  }

  find(filter?: (item: T) => boolean): T[] {
    const list = this.read();
    if (filter) {
      return list.filter(filter);
    }
    return list;
  }

  findOne(filter: (item: T) => boolean): T | null {
    const list = this.read();
    return list.find(filter) || null;
  }

  create(item: Omit<T, 'id'> & { id?: string }): T {
    const list = this.read();
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
    } as T;
    list.push(newItem);
    this.write(list);
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const list = this.read();
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    this.write(list);
    return list[idx];
  }

  delete(id: string): boolean {
    const list = this.read();
    const filterList = list.filter((item) => item.id !== id);
    if (filterList.length === list.length) return false;
    this.write(filterList);
    return true;
  }
}

// Password hashing utility using standard Node.js crypto (no external bcrypt dependency)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// User schema persistence object
export interface DBUser extends User {
  passwordHash: string;
}

export const Users = new LocalCollection<DBUser>('users.json');
export const Workouts = new LocalCollection<WorkoutLog>('workouts.json');
export const Diets = new LocalCollection<DietLog>('diets.json');
export const Reports = new LocalCollection<HealthReport>('reports.json');

// Initialize some sample seed data if empty to make the admin panel and dashboard look stunning
export function seedDataIfNeeded() {
  const allUsers = Users.find();
  if (allUsers.length === 0) {
    console.log('Seeding initial beautiful demo data for admin preview...');
    
    // Create admin user
    const adminUser = Users.create({
      name: 'FITQON Admin',
      email: 'admin@fitqon.com',
      passwordHash: hashPassword('admin123'),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      streak: 15,
    });

    // Create user 1: John Doe (Active)
    const john = Users.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: hashPassword('password123'),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      streak: 7,
    });

    // Create user 2: Jane Smith (Intermediate)
    const jane = Users.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: hashPassword('password123'),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      streak: 4,
    });

    // Create user 3: Alex Carter (Needs Attention)
    const alex = Users.create({
      name: 'Alex Carter',
      email: 'alex@example.com',
      passwordHash: hashPassword('password123'),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      streak: 1,
    });

    // Create daily logs for the last 15 days to populate graphs
    const intensities: ('Light' | 'Moderate' | 'Intense')[] = ['Light', 'Moderate', 'Intense'];
    const ratings: ('Excellent' | 'Great' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor')[] = [
      'Excellent', 'Great', 'Good', 'Average', 'Needs Improvement'
    ];
    
    const userIds = [john.id, jane.id, alex.id];
    const exercisesList = [
      { name: 'Bench Press', sets: 4, reps: 10, weight: '80kg' },
      { name: 'Squats', sets: 4, reps: 12, weight: '100kg' },
      { name: 'Deadlift', sets: 3, reps: 8, weight: '120kg' },
      { name: 'Running', sets: 1, reps: 1, duration: '30 mins' },
      { name: 'Yoga Planks', sets: 3, reps: 1, duration: '5 mins' },
      { name: 'Bicep Curls', sets: 3, reps: 15, weight: '15kg' },
    ];

    const foodList = [
      { name: 'Oatmeal with Honey', calories: 350, quantity: '1 bowl', mealType: 'breakfast' as const },
      { name: 'Grilled Chicken & Rice', calories: 650, quantity: '1 plate', mealType: 'lunch' as const },
      { name: 'Protein Shake', calories: 250, quantity: '1 shake', mealType: 'snack' as const },
      { name: 'Salmon & Broccoli', calories: 500, quantity: '1 portion', mealType: 'dinner' as const },
      { name: 'Double Cheese Pizza', calories: 1200, quantity: '4 slices', mealType: 'dinner' as const },
      { name: 'Avocado Salad', calories: 400, quantity: '1 bowl', mealType: 'lunch' as const },
    ];

    const avoidables = ['junk food', 'sugar', 'alcohol', 'processed food', 'soda'];

    // Generate historical logs over past 15 days
    for (let i = 14; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      userIds.forEach((userId, uIdx) => {
        // Simple random element choosing based on index & days
        const exercisesCount = 1 + ((uIdx + i) % 3);
        const dayExercises = [];
        for (let j = 0; j < exercisesCount; j++) {
          dayExercises.push(exercisesList[(uIdx + i + j) % exercisesList.length]);
        }

        const intensity = intensities[(uIdx + i) % intensities.length];
        const duration = 20 + ((uIdx * 15 + i * 5) % 65);

        // Record workout log
        Workouts.create({
          userId,
          date: dateStr,
          exercises: dayExercises,
          intensity,
          duration
        });

        // Record diet log
        const dayFood = [
          foodList[0], // Breakfast
          foodList[1 + ((uIdx + i) % 3)], // Lunch/Snack variation
          foodList[3 + ((uIdx + i) % 3)]  // Dinner variation
        ];
        const totalCalories = dayFood.reduce((sum, f) => sum + f.calories, 0);
        const waterIntake = 1.5 + ((uIdx + i) % 4) * 0.5; // 1.5L to 3.0L
        const avoided = [avoidables[uIdx % avoidables.length], avoidables[(uIdx + i) % avoidables.length]];

        DietLogFileSeed(userId, dateStr, dayFood, avoided, waterIntake, totalCalories);

        // Record health report
        const ratingIdx = (uIdx + i) % (ratings.length - (uIdx === 2 ? 1 : 0)); // Alex Carter gets lower ratings
        const rating = ratings[ratingIdx];
        const status = rating === 'Excellent' || rating === 'Great' || rating === 'Good' 
          ? 'Normal ✓' 
          : rating === 'Average' 
            ? 'Can Improve ↑' 
            : 'Needs Attention ⚠';

        Reports.create({
          userId,
          date: dateStr,
          rating,
          verdict: `Great job staying active today! Your check-in shows a balanced mix of training and conscious food portion tracking. Keep hydrated, stay consistent, and maintain high standards.`,
          dietTips: {
            add: [
              { icon: 'Apple', title: 'More Green Leafy Veggies', explanation: 'Boost your trace minerals and iron intake to recover faster.' },
              { icon: 'GlassWater', title: 'Electrolytes', explanation: 'Take electrolytes during long endurance runs for hydration.' }
            ],
            avoid: [
              { icon: 'Activity', title: 'Late-night high carbs', explanation: 'Heavy eating past 9 PM reduces deep sleep efficiency.' }
            ]
          },
          workoutFeedback: {
            good: `Log shows fantastic intensity with ${dayExercises[0]?.name || 'exercises'}. Your lifting volume is highly competitive.`,
            improve: `Make sure to allocate 5-10 minutes of active stretching post-workout to increase performance.`,
            nextWorkout: uIdx % 2 === 0 ? 'Upper Body Push (Chest, Shoulders, Triceps)' : 'Full Leg Hypertrophy & Calf Endurance'
          },
          roadmap: [
            { day: 1, title: 'Calorie Window Sync', description: 'Align major carbs centered around training window.' },
            { day: 2, title: 'Flexibility Routine', description: 'Perform 15 mins of deep hamstring and chest stretch.' },
            { day: 3, title: 'Intense HIIT Cardio', description: '30 mins of sprint intervals to maximize calorie burn.' },
            { day: 4, title: 'Active Rest & Recovery', description: 'Target 10K steps walking and focus heavily on sleep.' },
            { day: 5, title: 'Strength Base Day', description: 'Log progressive overload on compounds (Squat/Bench).' },
            { day: 6, title: 'Clean Diet Strict Run', description: 'Avoid any fast/processed meals with 100% whole foods.' },
            { day: 7, title: 'Full Fitness Evaluation', description: 'Perform weigh-in and review weekly metrics on Fitqon.' }
          ],
          status
        });
      });
    }
  }
}

// Special inner helper to create diet logs in seed
function DietLogFileSeed(userId: string, date: string, foodItems: any[], avoided: string[], waterIntake: number, totalCalories: number) {
  Diets.create({
    userId,
    date,
    foodItems,
    avoided,
    waterIntake,
    totalCalories
  });
}
