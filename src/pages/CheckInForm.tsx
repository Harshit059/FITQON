import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Dumbbell,
  Plus,
  Trash2,
  Apple,
  Droplet,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ExerciseEntry, FoodItem, ExerciseType, IntensityType } from '../types';

interface CheckInFormProps {
  user: any;
  token: string;
}

// Preset foods library to allow autocomplete / easy clicks
const FOOD_LIBRARY = [
  { name: 'Oatmeal with Honey', calories: 320, category: 'breakfast' },
  { name: 'Whole Eggs (3 boiled)', calories: 230, category: 'breakfast' },
  { name: 'Moong Dal (1 bowl)', calories: 150, category: 'lunch' },
  { name: 'Chapati / Roti (1 pc)', calories: 85, category: 'lunch' },
  { name: 'Basmati Rice (Plain, 1 plate)', calories: 240, category: 'lunch' },
  { name: 'Greek Yogurt with Berries', calories: 180, category: 'snack' },
  { name: 'Grilled Chicken Breast (200g)', calories: 330, category: 'lunch' },
  { name: 'White Rice (Cooked, 1 cup)', calories: 200, category: 'lunch' },
  { name: 'Protein Shake (1 scoop)', calories: 150, category: 'snack' },
  { name: 'Mixed Green Salad with Olive Oil', calories: 140, category: 'lunch' },
  { name: 'Pan-seared Salmon Fillet', calories: 350, category: 'dinner' },
  { name: 'Steamed Broccoli & Pepper', calories: 60, category: 'dinner' },
  { name: 'Sweet Potato (Baked)', calories: 160, category: 'dinner' },
  { name: 'Double Cheese Fast Pizza', calories: 950, category: 'cheat' },
  { name: 'Fizzy Soda / Cola Bottle', calories: 210, category: 'cheat' },
];

const PRESET_AVOID_TAGS = [
  'junk food',
  'sugar',
  'alcohol',
  'processed food',
  'dairy',
  'gluten',
  'soda',
  'deep fried food',
  'caffeine',
];

interface CardioCategory {
  id: string;
  name: string;
  type: 'running' | 'walking';
  met: number;
  burnRate: number; // Calories burned per minute (for an ~75kg person)
  description: string;
}

const CARDIO_CATEGORIES: CardioCategory[] = [
  { id: 'walk_leisure', name: 'Walking - Leisurely (Slow Pace)', type: 'walking', met: 3.0, burnRate: 3.8, description: 'Casual, relaxing stroll (~4 km/h / 2.5 mph). Perfect for recovery and mental clarity.' },
  { id: 'walk_brisk', name: 'Walking - Brisk (Zone 1 / Active)', type: 'walking', met: 4.3, burnRate: 5.2, description: 'Purposeful, active walk (~5.5 km/h / 3.5 mph). Accelerates fat oxidation.' },
  { id: 'walk_powers', name: 'Walking - Power Walk / Heavy Incline', type: 'walking', met: 6.0, burnRate: 7.2, description: 'Fast-paced power walk or walking loaded uphill. Focuses legs and calves.' },
  { id: 'jog_slow', name: 'Running - Zone 2 / Slow Jogging', type: 'running', met: 8.0, burnRate: 9.5, description: 'Conversational jogging pace (~8 km/h / 5 mph). Best aerobic endurance adaptation.' },
  { id: 'run_moderate', name: 'Running - Aerobic Pace / Moderate', type: 'running', met: 9.8, burnRate: 11.8, description: 'Steady, continuous run pace (~10 km/h / 6 mph). Substantial cardiovascular load.' },
  { id: 'run_sprint', name: 'Running - Intense Sprinting / Intervals', type: 'running', met: 12.5, burnRate: 15.2, description: 'High intensity track intervals or repeats (>12 km/h / 7+ mph). Anaerobic power.' }
];

export default function CheckInForm({ user, token }: CheckInFormProps) {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // STEP 1 STATE: WORKOUT LOGGER
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { name: '', sets: 3, reps: 10, weight: '', duration: '' },
  ]);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('Strength');
  const [intensity, setIntensity] = useState<IntensityType>('Moderate');
  const [workoutDuration, setWorkoutDuration] = useState<number>(45);

  // STEP 1 CARDIO CALCULATOR STATE
  const [selectedCardioId, setSelectedCardioId] = useState<string>('walk_brisk');
  const [cardioDuration, setCardioDuration] = useState<number>(30);
  const [cardioAddedAlert, setCardioAddedAlert] = useState<string | null>(null);

  // STEP 2 STATE: DIET LOGGER
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCal, setCustomFoodCal] = useState<number | ''>('');
  const [customFoodQty, setCustomFoodQty] = useState('1 serving');
  const [customFoodMeal, setCustomFoodMeal] = useState<FoodItem['mealType']>('breakfast');
  
  const [avoided, setAvoided] = useState<string[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(2.0); // Sliders in Litres
  
  // Custom total overrides if users want to edit estimated calories
  const estimatedCalories = foodItems.reduce((acc, f) => acc + (f.calories || 0), 0);

  // STEP 3 STATE: SUBMISSION STATE
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- WORKOUT OPERATIONS ---
  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: '', duration: '' }]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    if (exercises.length === 1) return;
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, key: keyof ExerciseEntry, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [key]: value };
    setExercises(updated);
  };

  const handleAddPresetWorkout = (type: 'running' | 'walking' | 'back_biceps' | 'squats_hiit' | 'bench_press') => {
    let presetEx: ExerciseEntry;
    if (type === 'running') {
      presetEx = { name: 'Outdoor Running (Zone 2)', sets: 1, reps: 1, weight: 'N/A', duration: '30 mins', caloriesBurned: 285 };
      setExerciseType('Cardio');
      setWorkoutDuration(30);
      setSelectedCardioId('jog_slow');
      setCardioDuration(30);
    } else if (type === 'walking') {
      presetEx = { name: 'Fasted Walking', sets: 1, reps: 1, weight: 'N/A', duration: '45 mins', caloriesBurned: 234 };
      setExerciseType('Cardio');
      setWorkoutDuration(45);
      setSelectedCardioId('walk_brisk');
      setCardioDuration(45);
    } else if (type === 'back_biceps') {
      presetEx = { name: 'Pullups & Dumbbell Bicep Curls', sets: 4, reps: 12, weight: '15kg', duration: '40 mins' };
      setExerciseType('Strength');
      setWorkoutDuration(45);
    } else if (type === 'squats_hiit') {
      presetEx = { name: 'Deep Bodyweight Squats & Jump Lunges', sets: 3, reps: 15, weight: 'Bodyweight', duration: '15 mins' };
      setExerciseType('HIIT');
      setWorkoutDuration(20);
    } else { // bench_press
      presetEx = { name: 'Incline Barbell Bench Press', sets: 4, reps: 8, weight: '60kg', duration: '30 mins' };
      setExerciseType('Strength');
      setWorkoutDuration(45);
    }

    // Replace the first item if empty, otherwise append
    if (exercises.length === 1 && exercises[0].name.trim() === '') {
      setExercises([presetEx]);
    } else {
      setExercises([...exercises, presetEx]);
    }
  };

  const handleCommitCardioTracker = () => {
    const selected = CARDIO_CATEGORIES.find((c) => c.id === selectedCardioId) || CARDIO_CATEGORIES[1];
    const burned = Math.round(selected.burnRate * cardioDuration);

    const cardioEx: ExerciseEntry = {
      name: `${selected.name}`,
      sets: 1,
      reps: 1,
      weight: 'N/A',
      duration: `${cardioDuration} mins`,
      caloriesBurned: burned,
    };

    // Replace the first item if empty, otherwise append
    if (exercises.length === 1 && exercises[0].name.trim() === '') {
      setExercises([cardioEx]);
    } else {
      setExercises([...exercises, cardioEx]);
    }

    setExerciseType('Cardio');
    setWorkoutDuration((prev) => Math.min(180, prev + cardioDuration));

    setCardioAddedAlert(`Logged ${selected.name} (${cardioDuration}m) — estimated burn of ${burned} kcal commits successfully!`);
    setTimeout(() => {
      setCardioAddedAlert(null);
    }, 4500);
  };

  // --- DIET OPERATIONS ---
  const handleAddPresetFood = (preset: typeof FOOD_LIBRARY[0]) => {
    const meal = preset.category === 'breakfast' ? 'breakfast' : preset.category === 'lunch' ? 'lunch' : preset.category === 'cheat' ? 'snack' : 'snack';
    const newItem: FoodItem = {
      name: preset.name,
      calories: preset.calories,
      quantity: '1 portion',
      mealType: meal as FoodItem['mealType'],
    };
    setFoodItems([...foodItems, newItem]);
  };

  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;

    const newItem: FoodItem = {
      name: customFoodName.trim(),
      calories: Number(customFoodCal || 0),
      quantity: customFoodQty,
      mealType: customFoodMeal,
    };

    setFoodItems([...foodItems, newItem]);
    setCustomFoodName('');
    setCustomFoodCal('');
    setCustomFoodQty('1 serving');
  };

  const handleRemoveFoodItem = (idx: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== idx));
  };

  const toggleAvoidTag = (tag: string) => {
    if (avoided.includes(tag)) {
      setAvoided(avoided.filter((t) => t !== tag));
    } else {
      setAvoided([...avoided, tag]);
    }
  };

  // --- FINAL SUBMISSION ---
  const handleFormSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      workout: {
        exercises: exercises.filter((ex) => ex.name.trim() !== ''),
        intensity,
        duration: workoutDuration,
      },
      diet: {
        foodItems,
        avoided,
        waterIntake,
        totalCalories: estimatedCalories,
      },
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await fetch('/api/checkin/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error filing daily workout checkin.');
      }

      // Save output report to sessionStorage for results visualizer
      sessionStorage.setItem('fitqon_current_report', JSON.stringify({
        workout: payload.workout,
        diet: payload.diet,
        report: data.report,
      }));

      // Redirect user to the elegant results page
      navigate('/results');
    } catch (err: any) {
      console.error('Checkin submission error:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent text-white p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6 animate-fade-in-up relative z-10">
      
      {/* QUICK PREVIOUS STEP / CONSOLE BACK NAVIGATION */}
      <div className="flex items-center justify-start">
        <button
          type="button"
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigate('/dashboard');
            }
          }}
          className="group flex items-center gap-2 border border-zinc-900 bg-zinc-950/65 px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-[#FACC15]/30 hover:bg-zinc-950 transition-all cursor-pointer"
          id="btn-form-prev-step"
        >
          <ArrowLeft className="w-4 h-4 text-[#FACC15] group-hover:-translate-x-1 transition-transform" />
          <span>{step > 1 ? `← PREVIOUS STEP (STEP ${step - 1})` : '← EXIT TO CONSOLE'}</span>
        </button>
      </div>

      {/* HEADER PROGRESS BAR */}
      <div className="flex flex-col space-y-5 text-left border-b border-zinc-900 pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest">
              STEPPED TELEMETRY SYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight mt-2.5">
              DAILY <span className="text-[#FACC15]">HABIT LOG</span>
            </h2>
          </div>
          <span className="font-mono text-xs bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg text-[#FACC15] uppercase font-bold">
            Step {step} of 3 COMPLETE
          </span>
        </div>

        {/* PROGRESS METER */}
        <div className="relative h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#FACC15] to-[#f59e0b] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* TABS HEADERS */}
        <div className="grid grid-cols-3 text-center text-[10px] sm:text-xs font-mono tracking-widest font-black uppercase pt-1">
          <span className={step >= 1 ? 'text-[#FACC15]' : 'text-zinc-600'}>1. Workout Activity</span>
          <span className={step >= 2 ? 'text-[#FACC15]' : 'text-zinc-600'}>2. Diet & Water</span>
          <span className={step >= 3 ? 'text-[#FACC15]' : 'text-zinc-600'}>3. Generate Report</span>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-3 bg-red-950/40 border border-red-900/50 text-red-300 p-4 rounded text-sm text-left">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* FORM CONTENTS SWITCH */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* STRENGTH OR FLEX LEVEL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="premium-card p-5 rounded-xl space-y-2">
                  <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                    PRIMARY ACTIVITY DOMAIN
                  </label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
                    className="w-full bg-zinc-950 border border-zinc-900 p-3.5 rounded-lg font-mono text-xs text-[#FACC15] focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC1520] font-bold"
                  >
                    <option value="Strength" className="bg-zinc-950 text-white">💪 STRENGTH / WEIGHTLIFTING</option>
                    <option value="Cardio" className="bg-zinc-950 text-white">🏃 ZONE-2 CARDIO / RUNNING</option>
                    <option value="Flexibility" className="bg-zinc-950 text-white">🧘 FLEXIBILITY / PILATES / YOGA</option>
                    <option value="HIIT" className="bg-zinc-950 text-white">⚡ HIIT / INTENSE SPRINTING</option>
                    <option value="Sports" className="bg-zinc-950 text-white">⚽ COMPETITIVE SPORTS / ATHLETICS</option>
                  </select>
                </div>

                <div className="premium-card p-5 rounded-xl space-y-2">
                  <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                    EXERTION INTENSITY LEVEL
                  </label>
                  <div className="grid grid-cols-3 bg-zinc-950 border border-zinc-900 rounded-lg p-1">
                    {(['Light', 'Moderate', 'Intense'] as IntensityType[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIntensity(level)}
                        className={`py-2 text-[10px] font-mono font-black uppercase rounded-md transition-all tracking-wider ${
                          intensity === level
                            ? 'bg-[#FACC15] text-black font-extrabold shadow-md shadow-[#FACC15]/10'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* TIMING */}
              <div className="premium-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                    TOTAL TRAINING DURATION
                  </label>
                  <span className="text-xs font-mono font-black text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-0.5 rounded-full">
                    {workoutDuration} MINUTES
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="flex-1 accent-[#FACC15] h-1.5 bg-zinc-950 rounded-lg cursor-pointer border border-zinc-900"
                  />
                  <div className="bg-zinc-950 border border-zinc-900 px-3.5 py-2 rounded-lg font-mono text-xs text-zinc-400 font-bold">
                    {workoutDuration}m
                  </div>
                </div>

                {/* QUICK ACTIVITY PRESET CHIPS */}
                <div className="pt-4 pb-2 space-y-2 border-t border-zinc-900/40 mt-4">
                  <span className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-black">
                    ⚡ QUICK ACTIVITY PRESET CHIPS (SELECT TO LOG INSTANTLY)
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { id: 'running', label: '🏃 Running (Zone-2)' },
                      { id: 'walking', label: '🚶 Fasted Walking' },
                      { id: 'back_biceps', label: '💪 Back & Biceps Split' },
                      { id: 'squats_hiit', label: '⚡ Squats & Jumps HIIT' },
                      { id: 'bench_press', label: '🏋️ Bench Press Strength' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAddPresetWorkout(preset.id as any)}
                        className="bg-zinc-900/50 hover:bg-[#FACC15]/10 border border-zinc-900/60 hover:border-[#FACC15]/40 text-xs text-zinc-400 hover:text-[#FACC15] px-3.5 py-2.5 rounded-xl flex items-center gap-2 font-mono cursor-pointer transition-all uppercase tracking-wide font-bold hover:scale-[1.01] active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FACC15]" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CARDIO CALORIC ESTIMATION DEVICE PANEL */}
                <div className="premium-card p-6 rounded-xl space-y-5 border border-zinc-900/80 bg-zinc-950/40 text-left relative overflow-hidden mt-6">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center gap-2.5 border-b border-zinc-900/80 pb-3">
                    <div className="bg-[#FACC15]/10 border border-[#FACC15]/25 p-2 rounded-lg">
                      <Flame className="w-5 h-5 text-[#FACC15] animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[8px] bg-zinc-950 text-[#FACC15] border border-[#FACC15]/10 px-2 py-0.5 rounded font-mono font-black uppercase tracking-widest inline-block">
                        INTELLIGENT METABOLIC ESTIMATOR
                      </span>
                      <h4 className="text-base font-black font-sans uppercase tracking-tight text-white mt-1">
                        RUNNING & WALKING <span className="text-[#FACC15]">CALORIC COEFFICIENTS</span>
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Categories selection list */}
                    <div className="lg:col-span-7 space-y-3">
                      <span className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 font-extrabold">// SELECT PRE-DEFINED CARDIO PROFILE</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {CARDIO_CATEGORIES.map((cfg) => {
                          const isSelected = selectedCardioId === cfg.id;
                          return (
                            <button
                              key={cfg.id}
                              type="button"
                              onClick={() => setSelectedCardioId(cfg.id)}
                              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                isSelected 
                                  ? 'bg-[#FACC15]/5 border-[#FACC15] shadow-lg shadow-[#FACC15]/5' 
                                  : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/35'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-white uppercase font-sans tracking-tight">
                                  {cfg.name}
                                </span>
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 ${
                                  cfg.type === 'running' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                  {cfg.type.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-zinc-500 line-clamp-2 mt-2 leading-tight">
                                {cfg.description}
                              </p>
                              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mt-2 pt-2 border-t border-zinc-900/40">
                                <span>MET Value: <strong className="text-[#FACC15]">{cfg.met}</strong></span>
                                <span>~{cfg.burnRate} kcal/m</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metric sliders and output logs */}
                    <div className="lg:col-span-5 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-zinc-400 font-extrabold uppercase">// SESSION TIMELINE</span>
                          <span className="text-[#FACC15] font-black">{cardioDuration} MINUTES</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="5"
                          value={cardioDuration}
                          onChange={(e) => setCardioDuration(Number(e.target.value))}
                          className="w-full accent-[#FACC15] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                          <span>5 MINS</span>
                          <span>60 MINS</span>
                          <span>120 MINS</span>
                        </div>
                      </div>

                      {/* Numerical Calorie Estimations */}
                      {(() => {
                        const activeItem = CARDIO_CATEGORIES.find(c => c.id === selectedCardioId) || CARDIO_CATEGORIES[1];
                        const totBurn = Math.round(activeItem.burnRate * cardioDuration);
                        return (
                          <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl text-center space-y-1 relative overflow-hidden">
                            <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase font-black block">ESTIMATED METABOLIC BURN</span>
                            <div className="flex items-baseline justify-center gap-1.5 pt-1">
                              <span className="text-3xl font-black font-sans text-[#FACC15] tracking-tight">{totBurn}</span>
                              <span className="text-xs font-mono font-extrabold text-zinc-500 uppercase">kcal</span>
                            </div>
                            <p className="text-[8.5px] font-mono text-zinc-500 leading-snug">
                              Calculated based on standard MET coefficient of {activeItem.met} for an average bodyweight.
                            </p>
                          </div>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={handleCommitCardioTracker}
                        className="w-full bg-[#FACC15] hover:bg-white text-black font-mono font-black py-3 rounded-lg text-[10px] uppercase tracking-widest transition-all glow-btn"
                      >
                        ✓ Commit Cardio Log Entry
                      </button>

                      {cardioAddedAlert && (
                        <div className="bg-emerald-950/30 border border-emerald-900/50 p-2.5 rounded-lg text-[9.5px] font-mono text-emerald-400 text-center leading-normal animate-fade-in">
                          {cardioAddedAlert}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DYNAMIC ROWS TABLE */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#FACC15] font-bold">
                      LOG INDIVIDUAL EXERCISES ({exercises.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddExerciseRow}
                      className="text-[10px] font-mono text-black font-black uppercase tracking-widest bg-[#FACC15] hover:bg-white px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-[#FACC15]/10 border border-transparent hover:scale-[1.01] active:scale-95 cursor-pointer glow-btn"
                    >
                      <Plus className="w-4 h-4 font-black" /> Add Exercise Row
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {exercises.map((entry, idx) => (
                      <div
                        key={idx}
                        className="premium-card p-4 rounded-xl grid grid-cols-12 gap-3 items-center"
                      >
                        <div className="col-span-12 sm:col-span-4">
                          <input
                            type="text"
                            required
                            value={entry.name}
                            onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Incline DB Bench Press"
                            className="w-full bg-zinc-950/80 border border-zinc-900 p-3 rounded-lg text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-[#FACC15]/40 font-semibold"
                          />
                          {entry.caloriesBurned && (
                            <div className="text-[9px] font-mono text-[#FACC15] mt-1 bg-[#FACC15]/10 px-2 py-0.5 rounded border border-[#FACC15]/20 inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#FACC15] fill-[#FACC15]" />
                              <span>Est. Calories Burned: <strong>{entry.caloriesBurned} kcal</strong></span>
                            </div>
                          )}
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={entry.sets}
                              onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                              placeholder="Sets"
                              className="w-full bg-zinc-955 bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs text-center text-white focus:outline-none focus:border-[#FACC15]/40 font-mono font-bold"
                            />
                            <span className="absolute right-2 top-2.5 text-[8px] font-mono text-zinc-500 uppercase font-black">s</span>
                          </div>
                        </div>

                        <div className="col-span-4 sm:col-span-2">
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={entry.reps}
                              onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                              placeholder="Reps"
                              className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs text-center text-white focus:outline-none focus:border-[#FACC15]/40 font-mono font-bold"
                            />
                            <span className="absolute right-2 top-2.5 text-[8px] font-mono text-zinc-500 uppercase font-black">r</span>
                          </div>
                        </div>

                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="text"
                          value={entry.weight}
                          onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                          placeholder="Weight (e.g. 75kg)"
                          className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs text-center text-white focus:outline-none focus:border-[#FACC15]/40 placeholder-zinc-700 font-semibold"
                        />
                      </div>

                      <div className="col-span-12 sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          disabled={exercises.length === 1}
                          className="text-zinc-500 hover:text-red-400 p-3 bg-zinc-950 hover:bg-red-955 border border-zinc-900 transition-all w-full flex items-center justify-center cursor-pointer rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>       </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-left"
            >
              {/* WATER SLIDER */}
              <div className="premium-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-300 font-bold">
                    DAILY HYDRATION LOG
                  </label>
                  <span className="text-xs font-mono font-black text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-0.5 rounded-full">
                    {waterIntake.toFixed(1)} LITRE TARGET
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.25"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(Number(e.target.value))}
                    className="flex-1 accent-[#FACC15] h-1.5 bg-zinc-950 rounded-lg cursor-pointer border border-zinc-900"
                  />
                  <div className="bg-zinc-950/90 border border-zinc-900 px-4 py-2.5 rounded-lg font-mono text-xs text-[#FACC15] flex items-center gap-2 font-bold shadow-inner">
                    <Droplet className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                    {waterIntake.toFixed(1)}L
                  </div>
                </div>
              </div>

              {/* PRESET CHIPS ROW */}
              <div className="premium-card p-6 rounded-xl space-y-3">
                <span className="block text-[9px] font-mono tracking-widest uppercase text-zinc-300 font-black">
                  POPULAR METRIC INGREDIENT CHIPS
                </span>
                <div className="flex flex-wrap gap-2 pt-1 max-h-[120px] overflow-y-auto pr-1">
                  {FOOD_LIBRARY.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddPresetFood(preset)}
                      className="bg-zinc-900/60 hover:bg-[#FACC15]/10 border border-zinc-900 hover:border-[#FACC15]/30 text-xs text-zinc-300 hover:text-[#FACC15] px-3.5 py-2 rounded-lg flex items-center gap-1.5 font-mono cursor-pointer transition-all uppercase tracking-wide font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>{preset.name}</span>
                      <span className="text-[9px] text-[#FACC15]/85 font-black bg-zinc-950/80 px-1.5 py-0.5 rounded ml-1 border border-[#FACC15]/10">
                        {preset.calories} kcal
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DIET ITEMS LISTED */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                {/* Food items logged table */}
                <div className="lg:col-span-12 flex flex-col space-y-3">
                  <span className="block text-[10px] font-mono tracking-widest uppercase text-[#FACC15] font-extrabold ml-1">
                    ITEMS CONSUMED ({foodItems.length})
                  </span>

                  {foodItems.length === 0 ? (
                    <div className="premium-card border-dashed p-10 rounded-xl text-center flex flex-col items-center justify-center">
                      <Apple className="w-8 h-8 text-zinc-500 mb-3" />
                      <p className="text-xs font-mono uppercase text-zinc-500 tracking-wider">No food logs submitted</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {foodItems.map((f, idx) => (
                        <div
                          key={idx}
                          className="premium-card p-3.5 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="text-left flex-1 min-w-0">
                            <span className="inline-block bg-zinc-950 text-[#FACC15] text-[8px] font-mono font-black px-2 py-0.5 rounded border border-zinc-900 uppercase mr-2.5">
                              {f.mealType}
                            </span>
                            <span className="text-xs font-bold text-zinc-200 truncate inline-block max-w-[150px] sm:max-w-[200px] align-middle">{f.name}</span>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">{f.quantity}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-[#FACC15] font-black whitespace-nowrap">
                              {f.calories} kcal
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFoodItem(idx)}
                              className="text-zinc-500 hover:text-red-400 p-2 bg-zinc-950 border border-zinc-900 hover:border-red-950 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Summary total banner */}
                      <div className="bg-[#FACC15]/5 border border-[#FACC15]/20 p-4 rounded-xl flex justify-between items-center shadow-lg">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold">TOTAL CONSUMED DIET BUDGET:</span>
                        <span className="text-sm font-black font-mono text-[#FACC15]">{estimatedCalories} KCAL</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Food Addition form */}
                <form
                  onSubmit={handleAddCustomFood}
                  className="lg:col-span-12 premium-card p-5 rounded-xl flex flex-col space-y-3.5 text-left mt-4"
                >
                  <span className="block text-[9px] font-mono tracking-widest uppercase text-zinc-300 font-black">
                    LOG CUSTOM BIOMETRICS & CONSUMED FOODS
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        required
                        value={customFoodName}
                        onChange={(e) => setCustomFoodName(e.target.value)}
                        placeholder="Food Name (e.g. Scrambled Eggs)"
                        className="w-full bg-zinc-950 border border-zinc-900 p-3.5 rounded-lg text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-[#FACC15]/45 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={customFoodCal}
                        onChange={(e) => setCustomFoodCal(e.target.value !== '' ? Number(e.target.value) : '')}
                        placeholder="Calories (kcal)"
                        className="w-full bg-zinc-950 border border-zinc-900 p-3.5 rounded-lg text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-[#FACC15]/45 font-mono"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={customFoodQty}
                        onChange={(e) => setCustomFoodQty(e.target.value)}
                        placeholder="Quantity / Portion"
                        className="w-full bg-zinc-950 border border-zinc-900 p-3.5 rounded-lg text-xs placeholder-zinc-700 text-white focus:outline-none focus:border-[#FACC15]/45 font-semibold"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <select
                        value={customFoodMeal}
                        onChange={(e) => setCustomFoodMeal(e.target.value as FoodItem['mealType'])}
                        className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-xs font-mono text-zinc-400 focus:outline-none focus:border-[#FACC15]/45 font-bold focus:text-[#FACC15]"
                      >
                        <option value="breakfast">BREAKFAST MEAL</option>
                        <option value="lunch">LUNCH MEAL</option>
                        <option value="dinner">DINNER MEAL</option>
                        <option value="snack">SNACK / SPORT STACK</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#FACC15] border border-transparent hover:border-[#FACC15] hover:bg-white text-black font-mono font-black py-3.5 rounded-lg text-[10px] uppercase tracking-widest transition-all glow-btn cursor-pointer w-full"
                  >
                    + Add New Ingredient
                  </button>
                </form>
              </div>

              {/* WHAT I AVOIDED TODAY MULTISELECT */}
              <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-zinc-400 mb-2">
                  WHAT I SUCCESSFULLY AVOIDED/REDUCED TODAY
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVOID_TAGS.map((tag) => {
                    const isSelected = avoided.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleAvoidTag(tag)}
                        className={`text-xs font-mono py-2 px-3 rounded uppercase border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-zinc-100 text-black border-white'
                            : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        ✓ {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* FINAL REVIEW LOG */}
              <div className="premium-card p-6 rounded-xl space-y-6">
                <div>
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest pb-2 border-b border-zinc-900 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
                    1. Daily Training Log Summary
                  </h4>
                  <div className="mt-3.5 space-y-2 font-mono">
                    <p className="text-xs text-zinc-400">
                      Primary Activity Domain: <span className="text-[#FACC15] font-bold">{exerciseType}</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Intensity Multiplier: <span className="text-[#FACC15] font-bold">{intensity}</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Training Duration: <span className="text-[#FACC15] font-bold">{workoutDuration} Minutes</span>
                    </p>
                    <div className="pt-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-black">Exercises Tracked:</p>
                      <ul className="list-disc pl-4 mt-2 space-y-1.5 font-sans">
                        {exercises
                          .filter((e) => e.name.trim() !== '')
                          .map((e, idx) => (
                            <li key={idx} className="text-xs text-zinc-300">
                              <span className="font-bold text-white">{e.name}</span> – <span className="text-zinc-400">{e.sets} Sets x {e.reps} Reps {e.weight ? `(${e.weight})` : ''}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest pb-2 border-b border-zinc-900 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse"></span>
                    2. Nutrition Tracker Metrics
                  </h4>
                  <div className="mt-3.5 space-y-2 font-mono">
                    <p className="text-xs text-zinc-400">
                      Hydration Intake: <span className="text-[#FACC15] font-bold">{waterIntake.toFixed(1)} Litres</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Estimated Calorie Budget: <span className="text-[#FACC15] font-bold">{estimatedCalories} kcal</span>
                    </p>
                    {avoided.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] text-zinc-500 uppercase font-black">Avoided Habits:</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {avoided.map((tag) => (
                            <span key={tag} className="bg-zinc-950 text-zinc-400 text-[10px] font-mono py-1 px-3 rounded-lg border border-zinc-900 select-none uppercase font-bold">
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION CALLOUTS */}
              <div className="p-4 bg-zinc-950/40 border border-[#FACC15]/10 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Upon submission, the <span className="text-white font-bold">FITQON AI Engine (Gemini Pro)</span> will analyze your active calorie coefficients, specific reps ratios, hydration markers, and avoidance indicators to formulate your personalized athletic diagnosis.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={submitting}
                className="w-full bg-[#FACC15] text-black font-mono font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-white active:scale-95 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:scale-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#FACC15]/10 hover:shadow-[#FACC15]/20 cursor-pointer glow-btn"
              >
                {submitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-dashed border-black rounded-full animate-spin"></span>
                    <span>FITQON Engine Analyzing Habits...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                    <span>Generate AI Diagnostic Report</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER BUTTONS ROW */}
      <div className="flex justify-between items-center border-t border-zinc-900 pt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 border border-zinc-900 px-4 py-3 text-xs text-zinc-300 font-mono uppercase bg-zinc-950 hover:bg-zinc-900 rounded-lg hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 border border-zinc-900 px-4 py-3 text-xs text-zinc-500 font-mono uppercase bg-zinc-950/20 rounded-lg hover:text-white transition-all cursor-pointer"
          >
            Cancel Form
          </button>
        )}

        {step < 3 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 bg-[#FACC15] hover:bg-white text-black px-6 py-3 text-xs font-mono uppercase font-black tracking-wider transition-all rounded-lg shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer glow-btn"
          >
            Continue Step <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
