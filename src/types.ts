/**
 * FITQON Web Application Types File
 */

export interface ExerciseEntry {
  name: string;
  sets: number;
  reps: number;
  weight?: string; // Optional weight used
  duration?: string; // Optional duration (e.g. "15 mins")
  caloriesBurned?: number; // Optional calorie estimation
}

export interface FoodItem {
  id?: string;
  name: string;
  quantity: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
}

export type ExerciseType = 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT' | 'Sports';
export type IntensityType = 'Light' | 'Moderate' | 'Intense';

export interface WorkoutLogForm {
  exercises: ExerciseEntry[];
  intensity: IntensityType;
  duration: number; // in minutes
}

export interface DietLogForm {
  foodItems: FoodItem[];
  avoided: string[]; // what I avoided today (e.g., ["sugar", "junk food"])
  waterIntake: number; // in litres
  totalCalories: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  streak: number;
  isAdmin?: boolean;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  exercises: ExerciseEntry[];
  intensity: IntensityType;
  duration: number;
}

export interface DietLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  foodItems: FoodItem[];
  avoided: string[];
  waterIntake: number;
  totalCalories: number;
}

export interface HealthReport {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  rating: 'Excellent' | 'Great' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor';
  verdict: string;
  dietTips: {
    add: { icon: string; title: string; explanation: string }[];
    avoid: { icon: string; title: string; explanation: string }[];
  };
  workoutFeedback: {
    good: string;
    improve: string;
    nextWorkout: string;
  };
  roadmap: {
    day: number;
    title: string;
    description: string;
  }[];
  status: 'Normal ✓' | 'Can Improve ↑' | 'Needs Attention ⚠';
}

export interface AdminStats {
  totalUsers: number;
  checkinsToday: number;
  avgRating: string;
  streakLeaders: { name: string; email: string; streak: number }[];
  ratingDistribution: { name: string; value: number }[];
  commonExercisesCount: { name: string; count: number }[];
  dailyCheckins: { date: string; count: number }[];
}
