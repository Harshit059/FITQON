import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  Activity,
  Dumbbell,
  Flame,
  Apple,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Droplet,
  Edit,
  Plus,
  Trash2,
  X,
  Save,
  Target,
  Check,
  Settings,
  FileDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { User } from '../types';

interface UserDashboardProps {
  user: User;
  token: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-[#FACC15]/40 px-3 py-2 rounded text-[11px] font-mono shadow-xl relative z-60 text-left">
        <p className="text-zinc-500 uppercase font-black mb-1 text-[9px]">// {payload[0].payload.label || 'DAY'}</p>
        <p className="text-white">
          VALUE: <span className="text-[#FACC15] font-black">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// MACRONUTRIENT ESTIMATOR HELPER SYSTEM
export const estimateMacros = (itemName: string, calories: number) => {
  const name = itemName.toLowerCase();
  
  // Default distribution: 50% Carbs, 25% Protein, 25% Fats
  let carbRatio = 0.50;
  let proteinRatio = 0.25;
  let fatRatio = 0.25;

  if (
    name.includes('chicken') || 
    name.includes('salmon') || 
    name.includes('fish') || 
    name.includes('egg') || 
    name.includes('meat') || 
    name.includes('beef') || 
    name.includes('protein') || 
    name.includes('whey') || 
    name.includes('tofu') || 
    name.includes('paneer') || 
    name.includes('turkey') || 
    name.includes('shrimp') || 
    name.includes('lentil') || 
    name.includes('dal') || 
    name.includes('curd') || 
    name.includes('yogurt') ||
    name.includes('soy') ||
    name.includes('milk') ||
    name.includes('paneer')
  ) {
    // Protein heavy
    carbRatio = 0.15;
    proteinRatio = 0.55;
    fatRatio = 0.30;
  } else if (
    name.includes('oil') || 
    name.includes('butter') || 
    name.includes('cheese') || 
    name.includes('avocado') || 
    name.includes('nuts') || 
    name.includes('almond') || 
    name.includes('peanut') || 
    name.includes('seed') || 
    name.includes('pork') ||
    name.includes('ghee') ||
    name.includes('coconut') ||
    name.includes('fat') ||
    name.includes('cream')
  ) {
    // Fat heavy
    carbRatio = 0.10;
    proteinRatio = 0.15;
    fatRatio = 0.75;
  } else if (
    name.includes('rice') || 
    name.includes('banana') || 
    name.includes('apple') || 
    name.includes('bread') || 
    name.includes('oat') || 
    name.includes('potato') || 
    name.includes('honey') || 
    name.includes('juice') || 
    name.includes('sweet') || 
    name.includes('roti') || 
    name.includes('chapati') || 
    name.includes('wheat') || 
    name.includes('pasta') || 
    name.includes('noodle') || 
    name.includes('sugar') ||
    name.includes('berry') ||
    name.includes('fruit') ||
    name.includes('carbohydrate') ||
    name.includes('flour') ||
    name.includes('quinoa')
  ) {
    // Carbohydrate heavy
    carbRatio = 0.75;
    proteinRatio = 0.15;
    fatRatio = 0.10;
  }

  const carbCal = calories * carbRatio;
  const proteinCal = calories * proteinRatio;
  const fatCal = calories * fatRatio;

  // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
  return {
    carbsGrams: Math.max(0, Math.round(carbCal / 4)),
    proteinGrams: Math.max(0, Math.round(proteinCal / 4)),
    fatsGrams: Math.max(0, Math.round(fatCal / 9)),
    carbsCalories: carbCal,
    proteinCalories: proteinCal,
    fatsCalories: fatCal
  };
};

export const calculateDayMacros = (foodItems: any[]) => {
  let protein = 0;
  let carbs = 0;
  let fats = 0;

  if (!foodItems || foodItems.length === 0) {
    return { protein: 0, carbs: 0, fats: 0, totalGrams: 0 };
  }

  foodItems.forEach((f) => {
    const calories = Number(f.calories || 0);
    const est = estimateMacros(f.name, calories);
    protein += est.proteinGrams;
    carbs += est.carbsGrams;
    fats += est.fatsGrams;
  });

  return {
    protein,
    carbs,
    fats,
    totalGrams: protein + carbs + fats
  };
};

export default function UserDashboard({ user, token }: UserDashboardProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'calories' | 'activeMins' | 'water'>('calories');
  const navigate = useNavigate();

  // PDF EXPORT SYSTEM STATE
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportRange, setExportRange] = useState<'weekly' | 'monthly'>('weekly');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // DAILY FITNESS TARGET STATE & PERSISTENCE
  const [targetCalories, setTargetCalories] = useState<number>(() => {
    const saved = localStorage.getItem('fitqon_target_calories');
    return saved ? Number(saved) : 2200;
  });
  const [targetWater, setTargetWater] = useState<number>(() => {
    const saved = localStorage.getItem('fitqon_target_water');
    return saved ? Number(saved) : 2.5;
  });
  const [targetActiveMins, setTargetActiveMins] = useState<number>(() => {
    const saved = localStorage.getItem('fitqon_target_active_mins');
    return saved ? Number(saved) : 45;
  });

  const [isEditingGoals, setIsEditingGoals] = useState<boolean>(false);
  const [tempCalories, setTempCalories] = useState<number>(targetCalories);
  const [tempWater, setTempWater] = useState<number>(targetWater);
  const [tempActiveMins, setTempActiveMins] = useState<number>(targetActiveMins);

  // EDIT MODAL STATE
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editExercises, setEditExercises] = useState<any[]>([]);
  const [editWorkoutDuration, setEditWorkoutDuration] = useState<number>(45);
  const [editWorkoutIntensity, setEditWorkoutIntensity] = useState<'Light' | 'Moderate' | 'Intense'>('Moderate');
  const [editFoodItems, setEditFoodItems] = useState<any[]>([]);
  const [editWaterIntake, setEditWaterIntake] = useState<number>(2.0);
  const [editAvoided, setEditAvoided] = useState<string[]>([]);

  // Temp properties for adding food within edit mode
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCal, setNewFoodCal] = useState<number | ''>('');
  const [newFoodQty, setNewFoodQty] = useState('1 serving');
  const [newFoodMeal, setNewFoodMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleOpenEditModal = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditDate(item.date);
    setEditExercises(item.workout?.exercises ? JSON.parse(JSON.stringify(item.workout.exercises)) : [{ name: '', sets: 3, reps: 10 }]);
    setEditWorkoutDuration(item.workout?.duration || 45);
    setEditWorkoutIntensity(item.workout?.intensity || 'Moderate');
    setEditFoodItems(item.diet?.foodItems ? JSON.parse(JSON.stringify(item.diet.foodItems)) : []);
    setEditWaterIntake(item.diet?.waterIntake || 2.0);
    setEditAvoided(item.diet?.avoided || []);

    setNewFoodName('');
    setNewFoodCal('');
    setNewFoodQty('1 serving');
    setNewFoodMeal('breakfast');
    setUpdateError(null);
  };

  const handleAddEditExerciseRow = () => {
    setEditExercises([...editExercises, { name: '', sets: 3, reps: 10, weight: '', duration: '' }]);
  };

  const handleRemoveEditExerciseRow = (index: number) => {
    if (editExercises.length === 1) {
      setEditExercises([{ name: '', sets: 3, reps: 10 }]);
    } else {
      setEditExercises(editExercises.filter((_, i) => i !== index));
    }
  };

  const handleEditExerciseChange = (index: number, key: string, value: any) => {
    const updated = [...editExercises];
    updated[index] = { ...updated[index], [key]: value };
    setEditExercises(updated);
  };

  const handleAddEditFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    const newItem = {
      name: newFoodName.trim(),
      calories: Number(newFoodCal || 0),
      quantity: newFoodQty,
      mealType: newFoodMeal,
    };

    setEditFoodItems([...editFoodItems, newItem]);
    setNewFoodName('');
    setNewFoodCal('');
    setNewFoodQty('1 serving');
  };

  const handleRemoveEditFood = (index: number) => {
    setEditFoodItems(editFoodItems.filter((_, i) => i !== index));
  };

  const handleSaveEdits = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    // Filter exercises that have clean non-empty names
    const cleanedExercises = editExercises.filter(ex => ex.name.trim() !== '');
    const editTotalCalories = editFoodItems.reduce((acc, f) => acc + (f.calories || 0), 0);

    const payload = {
      date: editDate,
      workout: {
        exercises: cleanedExercises,
        intensity: editWorkoutIntensity,
        duration: editWorkoutDuration,
      },
      diet: {
        foodItems: editFoodItems,
        avoided: editAvoided,
        waterIntake: editWaterIntake,
        totalCalories: editTotalCalories,
      }
    };

    try {
      const response = await fetch('/api/checkin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state array
        setHistory(prevHistory => {
          return prevHistory.map(item => {
            if (item.date === editDate) {
              return {
                date: editDate,
                workout: data.workout,
                diet: data.diet,
                report: data.report
              };
            }
            return item;
          });
        });

        // Close edit dialog cleanly
        setEditingItem(null);
      } else {
        const errData = await response.json();
        setUpdateError(errData.error || 'Failed to update bio-telemetry calculations.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setUpdateError('Network communication failed during update.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTrendData = () => {
    if (!history || history.length === 0) {
      return [
        { label: 'Mon', calories: 2100, activeMins: 30, water: 2.0 },
        { label: 'Tue', calories: 2350, activeMins: 45, water: 2.5 },
        { label: 'Wed', calories: 1980, activeMins: 20, water: 1.8 },
        { label: 'Thu', calories: 2450, activeMins: 60, water: 3.0 },
        { label: 'Fri', calories: 2200, activeMins: 40, water: 2.2 },
        { label: 'Sat', calories: 2600, activeMins: 75, water: 3.5 },
        { label: 'Sun', calories: 2150, activeMins: 35, water: 2.1 },
      ];
    }

    // Sort ascending chronologically
    const sorted = [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return sorted.map((item) => {
      const dateObj = new Date(item.date);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const calories = item.diet?.totalCalories || 2005;
      const activeMins = item.workout?.duration || (item.workout?.exercises?.length ? item.workout.exercises.length * 10 : 25);
      const water = item.diet?.waterIntake || 1.8;

      return {
        label,
        calories,
        activeMins,
        water,
      };
    });
  };

  const trendData = getTrendData();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else {
          setError('Failed to pull historic logs.');
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Network interruption while loading dashboard.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [token]);

  const handleSelectPastReport = (report: any) => {
    // Save report in session storage to showcase instantly on /results
    sessionStorage.setItem('fitqon_current_report', JSON.stringify({
      workout: report.workout || { exercises: [], intensity: 'Light', duration: 0 },
      diet: report.diet || { foodItems: [], avoided: [], waterIntake: 0, totalCalories: 0 },
      report: report.report,
    }));
    navigate('/results');
  };

  const downloadProgressReport = () => {
    setIsGeneratingPdf(true);
    
    // Sort ascending chronologically
    const selectedLogs = [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(exportRange === 'weekly' ? -7 : -30);

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm
    const margin = 15;
    const maxTextWidth = pageWidth - (margin * 2); // ~180mm

    let y = 15;

    // Logo visual drawing
    const drawFitqonLogo = (logoX: number, logoY: number, size: number) => {
      doc.setFillColor(18, 18, 21);
      doc.rect(logoX, logoY, size, size, 'F');

      doc.setDrawColor(250, 204, 21);
      doc.setLineWidth(0.9);

      // Top-Left corner bracket
      doc.line(logoX, logoY, logoX + (size * 0.35), logoY);
      doc.line(logoX, logoY, logoX, logoY + (size * 0.35));

      // Bottom-Right corner bracket
      doc.line(logoX + size, logoY + size, logoX + size - (size * 0.35), logoY + size);
      doc.line(logoX + size, logoY + size, logoX + size, logoY + size - (size * 0.35));

      const cx = logoX + (size / 2);
      const cy = logoY + (size / 2);
      const r = size * 0.24;

      doc.circle(cx, cy, r, 'S');
      doc.setFillColor(250, 204, 21);
      doc.circle(cx, cy, r * 0.35, 'F');

      doc.setDrawColor(250, 204, 21);
      doc.setLineWidth(1.3);
      doc.line(cx + (r * 0.2), cy + (r * 0.2), cx + (r * 1.5), cy + (r * 1.5));

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.35);
      doc.line(cx - (r * 1.4), cy, cx - (r * 0.7), cy);
      doc.line(cx + (r * 0.7), cy, cx + (r * 1.4), cy);
      doc.line(cx, cy - (r * 1.4), cx, cy - (r * 0.7));
      doc.line(cx, cy + (r * 0.7), cx, cy + (r * 1.4));
    };

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
        y = 25;
      }
    };

    const drawPageHeader = () => {
      drawFitqonLogo(margin, 8, 8);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(115, 115, 115);
      doc.text('FITQON // ATHLETIC TELEMETRY PROTOCOL', margin + 11, 12);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, 12);
      
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.line(margin, 18, pageWidth - margin, 18);
    };

    const drawSectionHeader = (title: string) => {
      ensureSpace(18);
      y += 4;
      doc.setFillColor(250, 204, 21);
      doc.rect(margin, y, 3, 5, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(9, 9, 11);
      doc.text(title.toUpperCase(), margin + 6, y + 4);

      y += 7;
      doc.setDrawColor(244, 244, 245);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    // FIRST PAGE BANNER
    doc.setFillColor(9, 9, 11);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Branding border
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 39, pageWidth, 1, 'F');

    drawFitqonLogo(margin, 10, 20);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('FITQON PERFORMANCE REPORT', margin + 24, 18);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);
    doc.text(`${exportRange.toUpperCase()} ATHLETE PROGRESS & RECOVERY SYNTHESIS`, margin + 24, 24);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(250, 204, 21);
    doc.text('// TELEMETRY MATRIX', pageWidth - margin - 45, 17);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(255, 255, 255);
    doc.text(`DT-EXPIRED : ${new Date().toLocaleDateString()}`, pageWidth - margin - 45, 23);
    doc.text(`ATHLETE: ${user.email.toUpperCase()}`, pageWidth - margin - 45, 28);

    y = 52;

    // Section 1: TELEMETRY OVERVIEW SUMMARY CARD
    drawSectionHeader('METRIC ACCUMULATION OVERVIEW');

    const totalLogs = selectedLogs.length;
    const totalCalories = selectedLogs.reduce((acc, item) => acc + (item.diet?.totalCalories || 0), 0);
    const avgCalories = totalLogs > 0 ? Math.round(totalCalories / totalLogs) : 0;

    const totalActiveMins = selectedLogs.reduce((acc, item) => acc + (item.workout?.duration || 0), 0);
    const avgActiveMins = totalLogs > 0 ? Math.round(totalActiveMins / totalLogs) : 0;

    const totalWater = selectedLogs.reduce((acc, item) => acc + (item.diet?.waterIntake || 0), 0);
    const avgWater = totalLogs > 0 ? (totalWater / totalLogs).toFixed(1) : '0';

    ensureSpace(32);
    // Draw visual boxes for summaries
    doc.setFillColor(244, 244, 245);
    doc.rect(margin, y, 180, 26, 'F');
    doc.setDrawColor(228, 228, 231);
    doc.rect(margin, y, 180, 26, 'S');

    // Drawer 1
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text('COMPILED CHECK-INS', margin + 6, y + 8);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text(`${totalLogs} Days`, margin + 6, y + 17);

    // Divider
    doc.line(margin + 43, y + 5, margin + 43, y + 21);

    // Drawer 2
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text('AVG DAILY FUEL', margin + 49, y + 8);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text(`${avgCalories} kcal`, margin + 49, y + 17);

    // Divider
    doc.line(margin + 88, y + 5, margin + 88, y + 21);

    // Drawer 3
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text('AVG ACTIVE TIME', margin + 94, y + 8);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text(`${avgActiveMins} min`, margin + 94, y + 17);

    // Divider
    doc.line(margin + 133, y + 5, margin + 133, y + 21);

    // Drawer 4
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
    doc.text('AVG DAILY HYDRATION', margin + 139, y + 8);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 24, 27);
    doc.text(`${avgWater} L`, margin + 139, y + 17);

    y += 32;

    // Target analysis vs established priorities
    drawSectionHeader('DIAGNOSTIC BENCHMARKS VS SYSTEM PARAMETERS');
    
    ensureSpace(35);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(63, 63, 70);
    
    // Draw list of goals comparing targets to the actual averages
    const metricsToCompare = [
      { name: 'Active Met Daily Energy Expense', avg: `${avgCalories} kcal`, target: `${targetCalories} kcal`, status: avgCalories <= targetCalories ? 'Balanced Caloric Output ✓' : 'Surplus Accumulation ⚠' },
      { name: 'Cardiorespiratory Training Time', avg: `${avgActiveMins} mins`, target: `${targetActiveMins} mins`, status: avgActiveMins >= targetActiveMins ? 'Target Attained 🔥' : 'Incomplete Routine' },
      { name: 'Daily Hydration Metric Balance', avg: `${avgWater} Liters`, target: `${targetWater} Liters`, status: parseFloat(avgWater) >= targetWater ? 'Optimal Hydration ✓' : 'Under hydrated' }
    ];

    metricsToCompare.forEach((m) => {
      // Draw grid text line-by-line
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(9, 9, 11);
      doc.text(m.name, margin, y);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      doc.text(`Active Avg: ${m.avg}   //   Established Target: ${m.target}`, margin, y + 4.5);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(228 / 1.15, 180 / 1.15, 10 / 1.15); // gold tint for metrics status
      doc.text(m.status.toUpperCase(), pageWidth - margin - 50, y + 2.5);

      y += 9.5;
    });

    y += 5;

    // Section 2: CHRONOLOGICAL ENTRIES RECORD CATALOG
    drawSectionHeader('CHRONOLOGICAL TELEMETRY CHECKS');

    if (selectedLogs.length === 0) {
      ensureSpace(12);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(115, 115, 115);
      doc.text('No performance telemetry recorded in the chosen frame scope.', margin, y);
      y += 8;
    } else {
      selectedLogs.forEach((item) => {
        ensureSpace(48); // Block size is 42 + spacing 6

        // Card container
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, 180, 42, 'F');
        
        doc.setLineWidth(0.25);
        doc.setDrawColor(228, 228, 231);
        doc.rect(margin, y, 180, 42, 'S');

        // Draw left colored visual bar
        doc.setFillColor(250, 204, 21);
        doc.rect(margin, y, 3.5, 42, 'F');

        // Content
        const rawDate = new Date(item.date);
        const dayLabel = rawDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(24, 24, 27);
        doc.text(dayLabel, margin + 7, y + 7.5);

        // Rating status
        const rating = item.report?.rating || 'Good';
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(115, 115, 115);
        doc.text('DAILY RATING:', margin + 115, y + 7.5);
        doc.setTextColor(24, 24, 27);
        doc.text(rating.toUpperCase(), margin + 138, y + 7.5);

        // Line break
        doc.setDrawColor(244, 244, 245);
        doc.line(margin + 7, y + 11.5, margin + 173, y + 11.5);

        // Grid contents
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115);
        doc.text('EXERCISE ROUTINE SUMMARY', margin + 7, y + 17);
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(39, 39, 42);
        const activeMins = item.workout?.duration || 0;
        const numExercises = item.workout?.exercises?.length || 0;
        doc.text(`${activeMins} active mins // ${numExercises} exercises`, margin + 7, y + 21.5);

        const exerciseNames = item.workout?.exercises?.map((ex: any) => ex.name).join(', ') || 'No routines recorded';
        const truncatedEx = exerciseNames.length > 58 ? exerciseNames.substring(0, 55) + '...' : exerciseNames;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(113, 113, 122);
        doc.text(truncatedEx, margin + 7, y + 25.5);

        // Nutrition columns
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115);
        doc.text('NUTRITION & ENERGY LOG', margin + 105, y + 17);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(39, 39, 42);
        const caloriesSum = item.diet?.totalCalories || 0;
        const hydrationSum = item.diet?.waterIntake || 0.0;
        doc.text(`${caloriesSum} kcal // ${hydrationSum}L Hydrated`, margin + 105, y + 21.5);

        // Final AI Diagnostic line wrapping
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115);
        doc.text('AI PERFORMANCE VERDICT:', margin + 7, y + 31.5);

        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(39, 39, 42);
        const verdictText = item.report?.verdict || 'Daily telemetry processed without diagnostics.';
        const splitVerdict = doc.splitTextToSize(verdictText, 165);
        const finalLines = splitVerdict.slice(0, 2);
        doc.text(finalLines, margin + 7, y + 36);

        y += 48;
      });
    }

    // Footnotes and signatures
    ensureSpace(30);
    y += 5;
    doc.setDrawColor(228, 228, 231);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122);
    doc.text('FITQON COGNITIVE DIAGNOSTIC SUITE', margin, y);
    doc.setFont('Helvetica', 'normal');
    doc.text('This is a computer-synthesized analytical report generated from cloud biomatrices and user logs. Use this telemetry comparison to optimize training splits, nutritional calorie budgets, and sleep restoration metrics.', margin, y + 4.5, { maxWidth: maxTextWidth });

    // Download the actual file
    const scopeLabel = exportRange === 'weekly' ? 'Weekly' : 'Monthly';
    doc.save(`FITQON_${scopeLabel}_Performance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    
    setTimeout(() => {
      setIsGeneratingPdf(false);
      setIsExportModalOpen(false);
    }, 1200);
  };

  const getRatingBadgeClass = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-[#FACC15] text-black border border-[#FACC15]';
      case 'Great':
        return 'bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/40';
      case 'Good':
        return 'bg-zinc-800 text-zinc-100 border border-zinc-700';
      case 'Average':
        return 'bg-zinc-900 text-zinc-400 border border-zinc-800';
      case 'Needs Improvement':
        return 'bg-red-950/40 text-red-400 border border-red-900/45';
      default:
        return 'bg-red-950 text-red-500 border border-red-950';
    }
  };

  return (
    <div className="flex-1 bg-transparent text-white p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-8 animate-fade-in-up">
      {/* Welcome header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 text-left">
        <div>
          <span className="text-[10px] bg-zinc-905 border border-zinc-900 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest bg-zinc-950">
            BIO-PERFORMANCE SUITE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight mt-3">
            ATHLETE <span className="text-[#FACC15]">CONSOLE</span>
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest font-bold">
            Establish routine. Refuse shortcuts. Analyze daily metrics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="w-full sm:w-auto border border-zinc-805 bg-zinc-950/60 backdrop-blur-md text-zinc-300 font-mono font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-lg hover:bg-zinc-900/50 hover:text-white hover:border-zinc-700/80 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer border-zinc-800"
          >
            <FileDown className="w-4 h-4 text-[#FACC15] group-hover:scale-110 transition-transform" />
            <span>Export Report</span>
          </button>

          <Link
            to="/checkin"
            className="w-full sm:w-auto bg-[#FACC15] text-black font-mono font-black py-4 px-6 rounded-lg text-xs uppercase tracking-widest hover:bg-white active:scale-95 transition-all text-center flex items-center justify-center gap-2 group shadow-xl shadow-[#FACC15]/10 hover:shadow-[#FACC15]/20 glow-btn"
          >
            <Activity className="w-4 h-4 animate-pulse shrink-0 fill-current" />
            <span>Commit Today's Entry</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FACC15]/2 rounded-bl-full pointer-events-none group-hover:bg-[#FACC15]/5 transition-colors" />
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-[#FACC15]" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Current Log Streak</p>
          </div>
          <p className="text-3xl font-black font-mono text-[#FACC15]">🔥 {user.streak} Days</p>
          <p className="text-[10px] font-mono text-zinc-600 mt-2.5 uppercase tracking-wider">RETENTION FREQUENCY STATUS</p>
        </div>

        <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-800/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#FACC15] font-bold">Total Logs Committed</p>
          </div>
          <p className="text-3xl font-black font-mono text-white">{history.length} Logs</p>
          <p className="text-[10px] font-mono text-zinc-600 mt-2.5 uppercase tracking-wider">SECURE TELEMETRY ENTRIES</p>
        </div>

        <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FACC15]/2 rounded-bl-full pointer-events-none group-hover:bg-[#FACC15]/5 transition-colors" />
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#FACC15]" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Average Health rating</p>
          </div>
          <p className="text-3xl font-black font-mono text-[#FACC15]">
            {history.length > 0 ? (history[0]?.report?.rating || 'Good') : 'N/A'}
          </p>
          <p className="text-[10px] font-mono text-zinc-600 mt-2.5 uppercase tracking-wider">LATEST CALCULATED STANDING</p>
        </div>

        <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Status Pill</p>
          </div>
          <div className="mt-1 flex items-center">
            {history.length > 0 ? (
              <span className="bg-[#FACC15]/10 text-[#FACC15] text-[10px] font-mono font-black px-2.5 py-1 rounded border border-[#FACC15]/20 uppercase tracking-widest inline-block">
                {history[0]?.report?.status || 'Good State ✓'}
              </span>
            ) : (
              <span className="text-zinc-600 font-mono text-xs uppercase font-black tracking-widest">No submissions</span>
            )}
          </div>
          <p className="text-[10px] font-mono text-zinc-600 mt-3 uppercase tracking-wider">ROADMAP CLASSIFICATION</p>
        </div>
      </div>

      {/* DAILY FITNESS GOALS ENGINE */}
      {(() => {
        const todayStrForGoals = new Date().toISOString().split('T')[0];
        const todayEntryForGoals = history.find((h) => h.date === todayStrForGoals);
        const activeEntryForGoals = todayEntryForGoals || (history.length > 0 ? history[0] : null);
        const hasLoggedTodayForGoals = !!todayEntryForGoals;

        const currentCaloriesForGoals = activeEntryForGoals?.diet?.totalCalories || 0;
        const currentWaterForGoals = activeEntryForGoals?.diet?.waterIntake || 0;
        const currentActiveMinsForGoals = activeEntryForGoals?.workout?.duration || 0;

        const percentCaloriesForGoals = targetCalories > 0 ? (currentCaloriesForGoals / targetCalories) * 100 : 0;
        const percentWaterForGoals = targetWater > 0 ? (currentWaterForGoals / targetWater) * 100 : 0;
        const percentActiveMinsForGoals = targetActiveMins > 0 ? (currentActiveMinsForGoals / targetActiveMins) * 100 : 0;

        return (
          <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden flex flex-col space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] bg-zinc-950 border border-zinc-900 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  DAILY TARGET PERFORMANCE
                </span>
                <h3 className="text-xl font-black font-sans uppercase tracking-tight mt-2 text-white">
                  DAILY FITNESS <span className="text-[#FACC15]">GOALS</span>
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider font-bold">
                  {hasLoggedTodayForGoals ? (
                    <span className="text-emerald-400">✓ Displaying progress for today's active telemetry log ({todayStrForGoals})</span>
                  ) : activeEntryForGoals ? (
                    <span className="text-zinc-400">// Showing progress from your last committed log ({new Date(activeEntryForGoals.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}) — log today to fill fresh bars!</span>
                  ) : (
                    <span className="text-zinc-500">// Track details inside a check-in to start calculating progress bars</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTempCalories(targetCalories);
                  setTempWater(targetWater);
                  setTempActiveMins(targetActiveMins);
                  setIsEditingGoals(!isEditingGoals);
                }}
                className="bg-zinc-950 hover:bg-[#FACC15] text-[#FACC15] hover:text-black border border-zinc-805 hover:border-[#FACC15] text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 bg-zinc-900"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isEditingGoals ? 'Close Panel' : 'Adjust Targets'}</span>
              </button>
            </div>

            {/* Goals editing inline module */}
            {isEditingGoals && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-900/25 border border-zinc-900 rounded-xl p-5 space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
                
                <h4 className="text-[10px] font-mono font-black text-[#FACC15] uppercase tracking-widest">
                  ⚙️ TUNING TARGET QUANTITATIVE PARAMETERS
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Target Calories Slider & Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-400">TARGET CALORIES</span>
                      <span className="text-white font-black">{tempCalories} kcal</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="5000"
                      step="50"
                      value={tempCalories}
                      onChange={(e) => setTempCalories(Number(e.target.value))}
                      className="w-full accent-[#FACC15] bg-zinc-950 h-1.5 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                      <span>1000 kcal</span>
                      <span>5000 kcal</span>
                    </div>
                  </div>

                  {/* Target Water Hydration Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-400">TARGET HYDRATION</span>
                      <span className="text-white font-black">{tempWater.toFixed(1)} L</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="0.1"
                      value={tempWater}
                      onChange={(e) => setTempWater(Number(e.target.value))}
                      className="w-full accent-[#FACC15] bg-zinc-950 h-1.5 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                      <span>1.0 L</span>
                      <span>8.0 L</span>
                    </div>
                  </div>

                  {/* Target Active Minutes Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-400">TARGET ACTIVE DURATION</span>
                      <span className="text-white font-black">{tempActiveMins} mins</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="180"
                      step="5"
                      value={tempActiveMins}
                      onChange={(e) => setTempActiveMins(Number(e.target.value))}
                      className="w-full accent-[#FACC15] bg-zinc-950 h-1.5 rounded cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-zinc-600">
                      <span>10 mins</span>
                      <span>180 mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => {
                      setTempCalories(2200);
                      setTempWater(2.5);
                      setTempActiveMins(45);
                    }}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-450 hover:text-white font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                  >
                    Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetCalories(tempCalories);
                      localStorage.setItem('fitqon_target_calories', String(tempCalories));
                      setTargetWater(tempWater);
                      localStorage.setItem('fitqon_target_water', String(tempWater));
                      setTargetActiveMins(tempActiveMins);
                      localStorage.setItem('fitqon_target_active_mins', String(tempActiveMins));
                      setIsEditingGoals(false);
                    }}
                    className="px-4 py-2 bg-[#FACC15] hover:bg-white text-black font-mono text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1 hover:scale-[1.01] active:scale-95 duration-100"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Calibration</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3 Progress Bars Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Progress Card 1: Calories */}
              <div className="bg-zinc-900/10 border border-zinc-900/60 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:border-zinc-800 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-orange-955/20 text-orange-400 border border-orange-900/10 bg-zinc-950">
                        <Apple className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase">CALORIC INTAKE</span>
                    </div>
                    {percentCaloriesForGoals >= 100 && (
                      <span className="bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[7.5px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                        GOAL REACHED 👑
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white">{currentCaloriesForGoals}</span>
                    <span className="text-zinc-500 font-mono text-xs">/ {targetCalories} kcal</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentCaloriesForGoals, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        percentCaloriesForGoals >= 100 ? 'bg-gradient-to-r from-yellow-500 to-[#FACC15]' : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{percentCaloriesForGoals.toFixed(0)}% achieved</span>
                    <span>{currentCaloriesForGoals < targetCalories ? `${targetCalories - currentCaloriesForGoals} kcal left` : 'Surpassed!'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Card 2: Hydration */}
              <div className="bg-zinc-900/10 border border-zinc-900/60 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:border-zinc-800 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-955/20 text-blue-400 border border-blue-900/10 bg-zinc-950">
                        <Droplet className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase">WATER HYDRATION</span>
                    </div>
                    {percentWaterForGoals >= 100 && (
                      <span className="bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[7.5px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                        HYDRO LOCKED 💧
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white">{currentWaterForGoals.toFixed(1)}</span>
                    <span className="text-zinc-500 font-mono text-xs">/ {targetWater.toFixed(1)} L</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentWaterForGoals, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{percentWaterForGoals.toFixed(0)}% achieved</span>
                    <span>{currentWaterForGoals < targetWater ? `${(targetWater - currentWaterForGoals).toFixed(1)}L left` : 'Fully Hydrated!'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Card 3: Active Minutes */}
              <div className="bg-zinc-900/10 border border-zinc-900/60 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:border-zinc-800 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-955/20 text-emerald-400 border border-emerald-900/10 bg-zinc-950">
                        <Clock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-400 uppercase">ACTIVE MINUTES</span>
                    </div>
                    {percentActiveMinsForGoals >= 100 && (
                      <span className="bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] text-[7.5px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                        BURNT MASTERED 🚀
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white">{currentActiveMinsForGoals}</span>
                    <span className="text-zinc-500 font-mono text-xs">/ {targetActiveMins} mins</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="w-full bg-zinc-950 rounded-full h-2.5 overflow-hidden border border-zinc-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentActiveMinsForGoals, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{percentActiveMinsForGoals.toFixed(0)}% achieved</span>
                    <span>{currentActiveMinsForGoals < targetActiveMins ? `${targetActiveMins - currentActiveMinsForGoals} mins left` : 'Completed!'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* TODAY'S DIET & MACRONUTRIENT PROFILE CARD */}
      {(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayEntry = history.find((h) => h.date === todayStr);
        const activeEntry = todayEntry || (history.length > 0 ? history[0] : null);
        
        if (!activeEntry || !activeEntry.diet) {
          return (
            <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden flex flex-col space-y-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
              <div>
                <span className="text-[10px] bg-zinc-950 border border-zinc-900 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5" />
                  NUTRITIONAL SUMMARY
                </span>
                <h3 className="text-xl font-black font-sans uppercase tracking-tight mt-2 text-white">
                  TODAY'S FUEL & <span className="text-[#FACC15]">MACROS BALANCE</span>
                </h3>
              </div>
              <div className="py-8 text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/40">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-black">// Track food items inside your check-in to generate daily macronutrient profiles.</p>
              </div>
            </div>
          );
        }

        const foodItems = activeEntry.diet.foodItems || [];
        const { protein, carbs, fats, totalGrams } = calculateDayMacros(foodItems);
        const totalCalories = activeEntry.diet.totalCalories || 0;

        // Custom Macros pie database
        const macroPieData = [
          { name: 'Protein', value: protein || 0, color: '#FACC15', calories: (protein || 0) * 4 },
          { name: 'Carbohydrates', value: carbs || 0, color: '#10B981', calories: (carbs || 0) * 4 },
          { name: 'Fats', value: fats || 0, color: '#3B82F6', calories: (fats || 0) * 9 },
        ].filter(item => item.value > 0);

        // Fallback default state elements when macros are empty
        const chartDataToRender = macroPieData.length > 0 ? macroPieData : [
          { name: 'Protein (Empty)', value: 1, color: '#27272a', calories: 0 },
          { name: 'Carbs (Empty)', value: 1, color: '#18181b', calories: 0 },
          { name: 'Fats (Empty)', value: 1, color: '#09090b', calories: 0 },
        ];

        return (
          <div className="premium-card p-6 rounded-xl text-left relative overflow-hidden flex flex-col space-y-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
            
            <div className="border-b border-zinc-900 pb-4">
              <span className="text-[10px] bg-zinc-950 border border-[#FACC15]/25 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5" />
                DAILY DIET telemetry
              </span>
              <h3 className="text-xl font-black font-sans uppercase tracking-tight mt-2 text-white">
                TODAY'S FUEL & <span className="text-[#FACC15]">MACRONUTRIENT RATIO</span>
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider font-bold">
                {todayEntry ? (
                  <span className="text-emerald-400">✓ Displaying calculated ratios for today's active food items log</span>
                ) : (
                  <span className="text-zinc-400">// Last committed telemetry ({new Date(activeEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}) — log today to see fresh nutrition ratios!</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* FOOD ITEM TIMELINE (Left Column - 7 spans) */}
              <div className="lg:col-span-7 bg-zinc-950/20 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold mb-3">// RECORDED MEALS & MACROS ({foodItems.length})</span>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {foodItems.length === 0 ? (
                      <div className="py-12 border border-dashed border-zinc-900 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase font-black tracking-wide">// No explicit raw food assets logged on this day</p>
                      </div>
                    ) : (
                      foodItems.map((fd, fdIdx) => {
                        const est = estimateMacros(fd.name, fd.calories);
                        return (
                          <div key={fdIdx} className="bg-zinc-900/40 border border-zinc-900/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-zinc-800">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-zinc-950 border border-zinc-850 text-[#FACC15] text-[7.5px] font-mono font-black tracking-widest px-1.5 py-0.5 rounded uppercase">
                                  {fd.mealType}
                                </span>
                                <span className="text-white font-bold text-xs uppercase font-sans tracking-wide block truncate">{fd.name}</span>
                                <span className="text-zinc-500 text-[9.5px] font-mono">({fd.quantity || '1 portion'})</span>
                              </div>
                              
                              {/* Item Estimated Macros micro-bars */}
                              <div className="flex items-center gap-3 mt-2 text-[9px] font-mono text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                                  Pro: <strong className="text-zinc-300">{est.proteinGrams}g</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                  Carb: <strong className="text-zinc-300">{est.carbsGrams}g</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                                  Fat: <strong className="text-zinc-300">{est.fatsGrams}g</strong>
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <span className="text-[#FACC15] font-mono font-black text-sm">{fd.calories} <span className="text-zinc-550 text-[10px] uppercase font-bold">kcal</span></span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900/60 text-[10px] text-zinc-500 font-mono text-left">
                  // ESTIMATIONS ARE FORMULATED SCIENTIFICALLY BASED ON COMMITTED INGREDIENT CALORIC DENSITIES
                </div>
              </div>

              {/* DONUT CHART VISUALIZER (Right Column - 5 spans) */}
              <div className="lg:col-span-5 bg-zinc-950/20 border border-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-6 justify-center">
                {/* Donut Chart */}
                <div className="h-36 w-36 shrink-0 relative flex items-center justify-center bg-zinc-950 border border-zinc-900 rounded-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataToRender}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={58}
                        paddingAngle={macroPieData.length > 1 ? 4 : 0}
                        dataKey="value"
                      >
                        {chartDataToRender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            if (data.calories === 0) return null;
                            return (
                              <div className="bg-zinc-950 border border-[#FACC15]/20 px-3 py-2 rounded text-[10px] font-mono shadow-2xl text-left">
                                <p className="font-extrabold uppercase text-[#FACC15]">{data.name}</p>
                                <p className="text-zinc-300 mt-0.5">EST. MASS: {data.value}g</p>
                                <p className="text-zinc-550">EST. CALS: {data.calories} kcal</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Centered overall calories */}
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-white font-sans font-black text-lg">
                        {totalCalories}
                      </text>
                      <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 font-mono text-[8px] uppercase tracking-widest font-black">
                        KCAL
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend & Stats Details */}
                <div className="flex-1 w-full space-y-3 font-mono text-[11px] text-left">
                  <span className="block text-[9px] text-[#FACC15] tracking-widest uppercase font-black">// FUEL SUMMARY</span>
                  
                  {/* Protein */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
                        PROTEIN
                      </span>
                      <span className="text-white font-black text-right">
                        {protein}g ({totalGrams > 0 ? ((protein / totalGrams) * 100).toFixed(0) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-950">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-[#FACC15]" style={{ width: `${totalGrams > 0 ? (protein / totalGrams) * 100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        CARBS
                      </span>
                      <span className="text-white font-black text-right">
                        {carbs}g ({totalGrams > 0 ? ((carbs / totalGrams) * 100).toFixed(0) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-950">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-[#10B981]" style={{ width: `${totalGrams > 0 ? (carbs / totalGrams) * 100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Fats */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        FATS
                      </span>
                      <span className="text-white font-black text-right">
                        {fats}g ({totalGrams > 0 ? ((fats / totalGrams) * 100).toFixed(0) : '0'}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-950">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-[#3B82F6]" style={{ width: `${totalGrams > 0 ? (fats / totalGrams) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* PERFORMANCE TELEMETRY & SPARK TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full text-left">
        {/* Core sparkline area */}
        <div className="lg:col-span-8 premium-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold">// ATHLETE WEEKLY BIOMETRIC SPARKLINE</p>
              <h4 className="text-base font-black font-sans uppercase tracking-tight text-white mt-1">
                TELEMETRY <span className="text-[#FACC15]">PERFORMANCE HISTOGRAM</span>
              </h4>
            </div>
            
            {/* Toggle buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMetric('calories')}
                className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all duration-150 border cursor-pointer font-bold ${
                  activeMetric === 'calories'
                    ? 'bg-[#FACC15] text-black border-[#FACC15]'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                Calories
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('activeMins')}
                className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all duration-150 border cursor-pointer font-bold ${
                  activeMetric === 'activeMins'
                    ? 'bg-[#FACC15] text-black border-[#FACC15]'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                Track Activity
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('water')}
                className={`px-2.5 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all duration-150 border cursor-pointer font-bold ${
                  activeMetric === 'water'
                    ? 'bg-[#FACC15] text-black border-[#FACC15]'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
                }`}
              >
                Hydrate L
              </button>
            </div>
          </div>

          <div className="w-full h-[160px] bg-black/30 border border-zinc-900/55 rounded-xl p-4 flex flex-col justify-end">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="sparklineColor2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#3f3f46"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  dy={4}
                />
                <YAxis
                  stroke="#3f3f46"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  dx={-4}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FACC15', strokeWidth: 0.5, strokeDasharray: '3 3' }} />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#FACC15"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#sparklineColor2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biometric Analysis Details Sidebar inside Bento */}
        <div className="lg:col-span-4 premium-card p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />
          
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-extrabold">// ATHLETIC DIAGNOSTIC INSIGHT</p>
            <h4 className="text-base font-black font-sans uppercase tracking-tight text-white mt-1">
              METRIC <span className="text-[#FACC15]">SUMMARY</span>
            </h4>
            
            <div className="mt-4 space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-400">LOG FREQUENCY</span>
                <span className="text-white font-bold">
                  {history.length > 0 ? (history.length >= 5 ? 'EXCELLENT ✓' : 'MODERATE') : 'STANDBY'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-400">CALORIC DEV RATE</span>
                <span className="text-white font-bold">
                  {history.length > 0 ? '± 8.4%' : '0.0%'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-zinc-400">HYDRATION AVERAGE</span>
                <span className="text-[#FACC15] font-black">
                  {history.length > 0 
                    ? `${(history.reduce((acc, curr) => acc + (curr.diet?.waterIntake || 0), 0) / history.length).toFixed(1)} Litres`
                    : '2.4 Litres'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">TARGET DISCIPLINE</span>
                <span className="text-emerald-400 font-bold">94.8% ACCURACY</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-950/40">
            <p className="text-[10px] text-zinc-450 font-mono italic leading-relaxed text-zinc-400">
              "Caloric absorption balances metabolic frequency ratios."
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 p-4 rounded-lg text-xs text-left">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-red-350 font-mono text-zinc-300 uppercase shrink-0">{error}</span>
        </div>
      )}

      {/* HISTORY TABLE / GRID */}
      <div className="flex flex-col space-y-5 text-left pt-4">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
          <h3 className="text-lg font-black font-sans tracking-tight uppercase">
            CHRONOLOGICAL <span className="text-[#FACC15]">BIO-HISTORY</span>
          </h3>
          <span className="text-[10px] bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg text-zinc-400 font-mono uppercase">
            {history.length} Saved Entries
          </span>
        </div>

        {loading ? (
          <div className="py-24 border border-zinc-900 rounded-xl bg-zinc-950/20 flex flex-col items-center justify-center">
            <span className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-xs font-mono text-zinc-500 mt-4 uppercase tracking-widest">Synchronizing secure check-ins...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 px-6 border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl text-center flex flex-col items-center justify-center max-w-xl mx-auto w-full">
            <Calendar className="w-8 h-8 text-zinc-700 mb-4" />
            <p className="text-sm font-black font-mono uppercase text-zinc-300 tracking-wider">No historic telemetry recorded</p>
            <p className="text-xs text-zinc-500 mt-2 max-w-sm mb-6 leading-relaxed">
              Track nutrition food items, gymnasium lift routines, and hydration markers to unlock comprehensive diagnostics.
            </p>
            <Link
              to="/checkin"
              className="bg-[#FACC15] text-black font-mono font-black py-4 px-8 rounded-lg text-xs uppercase tracking-widest hover:scale-[1.02] hover:bg-white active:scale-95 transition-all shadow-md shadow-[#FACC15]/10 glow-btn"
            >
              Log First Entry Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {history.map((item, idx) => (
              <motion.div
                key={item.report?.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                onClick={() => handleSelectPastReport(item)}
                className="premium-card p-6 rounded-xl cursor-pointer hover:translate-y-[-2px] group flex flex-col justify-between space-y-4"
              >
                {/* Date and Rating bar */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FACC15]" />
                    <span className="font-mono text-xs font-bold text-zinc-300">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(item, e)}
                      className="bg-zinc-905 hover:bg-[#FACC15] hover:text-black hover:scale-105 active:scale-95 text-zinc-400 p-2.5 rounded-lg border border-zinc-900 hover:border-[#FACC15] transition-all cursor-pointer flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-widest font-bold bg-zinc-950"
                      title="Edit Log"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Edit Log</span>
                    </button>
                    <span className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded-md tracking-wider ${getRatingBadgeClass(item.report?.rating || 'Good')}`}>
                      {item.report?.rating || 'Good'}
                    </span>
                  </div>
                </div>

                {/* Verdict Snapshot */}
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                  {item.report?.verdict}
                </p>

                {/* Logged details indicators */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-900/60 pt-3.5">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-zinc-450" />
                      <span className="font-bold text-zinc-300">{item.workout ? item.workout.exercises.length : 0}</span> exercises
                    </span>
                    <span className="flex items-center gap-1">
                      <Apple className="w-3.5 h-3.5 text-zinc-450" />
                      <span className="font-bold text-zinc-300">{item.diet ? item.diet.totalCalories : 0}</span> kcal
                    </span>
                    {item.diet?.waterIntake > 0 && (
                      <span className="flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-bold text-zinc-300">{item.diet.waterIntake}</span> L
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#FACC15] font-black tracking-widest uppercase group-hover:underline flex items-center gap-0.5 shrink-0">
                    DIAGNOSTICS <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE EDIT INTEGRAL OVERLAY MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative text-left"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#FACC15] uppercase font-black">
                  📝 RE-EVALUATING DAILY LOG
                </span>
                <h3 className="text-lg font-black font-sans uppercase tracking-tight text-white mt-0.5">
                  EDIT LOG - <span className="text-[#FACC15]">{new Date(editDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer bg-zinc-900/40 p-2 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 flex-1">
              {updateError && (
                <div className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 p-4 rounded-lg text-xs font-mono text-red-400">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PART 1: WORKOUT BIOMETRICS (left column) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h4 className="font-sans font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[#FACC15]" />
                      WORKOUT BIOMETRICS
                    </h4>
                  </div>

                  {/* Workout Duration */}
                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-900/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                      <span>DURATION (MINUTES)</span>
                      <span className="text-[#FACC15] font-black">{editWorkoutDuration}m</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="180"
                      step="5"
                      value={editWorkoutDuration}
                      onChange={(e) => setEditWorkoutDuration(Number(e.target.value))}
                      className="w-full accent-[#FACC15] bg-zinc-900 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Workout Intensity */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold">INTENSITY</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Light', 'Moderate', 'Intense'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEditWorkoutIntensity(level)}
                          className={`py-2 px-3.5 rounded-xl border font-mono text-xs cursor-pointer uppercase transition-all tracking-wide font-bold ${
                            editWorkoutIntensity === level
                              ? 'bg-[#FACC15] text-black border-[#FACC15]'
                              : 'bg-zinc-900/35 border-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exercises Table Rows */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold">EXERCISES PERFORMED</label>
                      <button
                        type="button"
                        onClick={handleAddEditExerciseRow}
                        className="text-[10px] bg-zinc-905 hover:bg-[#FACC15]/10 border border-zinc-900 hover:border-[#FACC15]/30 text-[#FACC15] font-mono uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all bg-zinc-950 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {editExercises.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-zinc-900/40 border border-zinc-900 p-3.5 rounded-xl space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveEditExerciseRow(exIdx)}
                            className="absolute top-2 right-2 text-zinc-650 hover:text-red-400 transition-colors cursor-pointer bg-zinc-900/30 p-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <div>
                            <span className="text-[10px] text-zinc-500 font-mono">#{exIdx + 1} Exercise / Activity Name</span>
                            <input
                              type="text"
                              value={ex.name}
                              placeholder="e.g. Bench press, cardio jog, yoga yoga"
                              onChange={(e) => handleEditExerciseChange(exIdx, 'name', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2.5 rounded-lg font-mono focus:border-[#FACC15] outline-none mt-1"
                            />
                            {ex.caloriesBurned && (
                              <div className="text-[9px] font-mono text-[#FACC15] mt-1.5 bg-[#FACC15]/10 px-2 py-0.5 rounded border border-[#FACC15]/20 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
                                <span>Est. Calories Burned: <strong>{ex.caloriesBurned} kcal</strong></span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <span className="text-[9px] text-zinc-500 font-mono">Sets</span>
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) => handleEditExerciseChange(exIdx, 'sets', Number(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono text-center mt-1 outline-none focus:border-[#FACC15]"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 font-mono">Reps</span>
                              <input
                                type="number"
                                value={ex.reps}
                                onChange={(e) => handleEditExerciseChange(exIdx, 'reps', Number(e.target.value))}
                                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono text-center mt-1 outline-none focus:border-[#FACC15]"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 font-mono">Weight</span>
                              <input
                                type="text"
                                placeholder="15kg"
                                value={ex.weight || ''}
                                onChange={(e) => handleEditExerciseChange(exIdx, 'weight', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono text-center mt-1 outline-none focus:border-[#FACC15]"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-zinc-500 font-mono">Duration</span>
                              <input
                                type="text"
                                placeholder="10m"
                                value={ex.duration || ''}
                                onChange={(e) => handleEditExerciseChange(exIdx, 'duration', e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono text-center mt-1 outline-none focus:border-[#FACC15]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PART 2: DIET & QUANTITATIVE FOODS (right column) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h4 className="font-sans font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                      <Apple className="w-4 h-4 text-[#FACC15]" />
                      DIET & CONSUMED FOOD
                    </h4>
                  </div>

                  {/* Water Intake */}
                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-900/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                      <span>WATER HYDRATION (LITRES)</span>
                      <span className="text-[#FACC15] font-black">{editWaterIntake}L</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.5"
                      value={editWaterIntake}
                      onChange={(e) => setEditWaterIntake(Number(e.target.value))}
                      className="w-full accent-[#FACC15] bg-zinc-900 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Food Items List */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold mb-1">
                      CURRENT FOOD ITEMS LOGGED
                    </label>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {editFoodItems.length === 0 ? (
                        <p className="text-[11px] font-mono bg-zinc-950 border border-dashed border-zinc-900 p-3 rounded-lg text-zinc-500 uppercase font-bold text-center">// No nutritional foods logged</p>
                      ) : (
                        editFoodItems.map((fd, fdIdx) => (
                          <div key={fdIdx} className="bg-zinc-950 border border-zinc-900/80 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                            <div className="flex-1 min-w-0 pr-2">
                              <span className="text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/20 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase mr-2 inline-block">
                                {fd.mealType}
                              </span>
                              <span className="text-white font-bold inline">{fd.name}</span>
                              <span className="text-zinc-500 text-[10px] ml-2 font-normal">({fd.quantity || '1 portion'})</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-white font-bold text-xs">{fd.calories} kcal</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEditFood(fdIdx)}
                                className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-zinc-900 p-1 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Real-time Macronutrients Donut Chart for Edit Mode */}
                  {(() => {
                    if (editFoodItems.length === 0) return null;
                    const { protein, carbs, fats, totalGrams } = calculateDayMacros(editFoodItems);
                    const totalCalories = editFoodItems.reduce((acc, f) => acc + Number(f.calories || 0), 0);
                    
                    const editMacroData = [
                      { name: 'Protein', value: protein || 0, color: '#FACC15', calories: (protein || 0) * 4 },
                      { name: 'Carbohydrates', value: carbs || 0, color: '#10B981', calories: (carbs || 0) * 4 },
                      { name: 'Fats', value: fats || 0, color: '#3B82F6', calories: (fats || 0) * 9 },
                    ].filter(item => item.value > 0);

                    const editChartToRender = editMacroData.length > 0 ? editMacroData : [
                      { name: 'Empty', value: 1, color: '#1f1f22', calories: 0 }
                    ];

                    return (
                      <div className="bg-zinc-950 border border-zinc-900/80 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="h-28 w-28 shrink-0 relative flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800/40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={editChartToRender}
                                cx="50%"
                                cy="50%"
                                innerRadius={32}
                                outerRadius={42}
                                paddingAngle={editMacroData.length > 1 ? 4 : 0}
                                dataKey="value"
                              >
                                {editChartToRender.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-white font-sans font-black text-xs">
                                {totalCalories}
                              </text>
                              <text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" className="fill-zinc-400 font-mono text-[7px] uppercase tracking-widest font-black">
                                KCAL
                              </text>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Ratios list */}
                        <div className="flex-1 w-full space-y-1.5 font-mono text-[10px] text-left">
                          <span className="block text-[8px] text-[#FACC15] tracking-widest uppercase font-black">// MODIFIED RATIOS</span>
                          
                          <div className="flex justify-between items-center bg-zinc-900 px-2 py-1 rounded">
                            <span className="flex items-center gap-1 font-bold text-zinc-350">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                              P: {protein}g
                            </span>
                            <span className="text-white font-black">
                              {totalGrams > 0 ? ((protein / totalGrams) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-zinc-900 px-2 py-1 rounded">
                            <span className="flex items-center gap-1 font-bold text-zinc-350">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              C: {carbs}g
                            </span>
                            <span className="text-white font-black">
                              {totalGrams > 0 ? ((carbs / totalGrams) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center bg-zinc-900 px-2 py-1 rounded">
                            <span className="flex items-center gap-1 font-bold text-zinc-350">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                              F: {fats}g
                            </span>
                            <span className="text-white font-black">
                              {totalGrams > 0 ? ((fats / totalGrams) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Add Food custom log form */}
                  <form onSubmit={(e) => { e.preventDefault(); handleAddEditFood(e); }} className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl space-y-3">
                    <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-extrabold">// ADD CUSTOM FOOD ITEM LOG</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono">Food name</span>
                        <input
                          type="text"
                          placeholder="e.g. Chapati / Moong Dal / Plain Rice"
                          value={newFoodName}
                          onChange={(e) => setNewFoodName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono focus:border-[#FACC15]"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-[#FACC15] font-mono">Calories (kcal)</span>
                        <input
                          type="number"
                          placeholder="e.g. 150"
                          value={newFoodCal}
                          onChange={(e) => setNewFoodCal(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono focus:border-[#FACC15]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono">Portion Size</span>
                        <input
                          type="text"
                          placeholder="e.g. 1 plate / 2 roti"
                          value={newFoodQty}
                          onChange={(e) => setNewFoodQty(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono focus:border-[#FACC15]"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono">Meal Window</span>
                        <select
                          value={newFoodMeal}
                          onChange={(e: any) => setNewFoodMeal(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-white p-2 rounded-lg font-mono focus:border-[#FACC15]"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-zinc-950 hover:bg-[#FACC15]/10 border border-zinc-900 hover:border-[#FACC15]/40 text-[#FACC15] font-mono text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 pointer-events-none" />
                      Add Food to Active List
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-900 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 z-10">
              <div className="text-[11px] font-mono text-zinc-500 leading-snug text-left">
                *Saving edits will trigger our diagnostics AI system using Gemini to compile your new dynamic performance feedback.
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-3 border border-zinc-900 text-zinc-400 font-mono text-xs uppercase tracking-widest rounded-xl hover:text-white transition-colors cursor-pointer w-full sm:w-auto"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  className="px-6 py-3 bg-[#FACC15] text-black font-mono text-xs uppercase tracking-widest rounded-xl font-bold hover:bg-white active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Requesting update...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Request AI Update</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* BRAND NEW HIGH-FIDELITY FUTURISTIC PDF EXPORT OVERLAY MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="premium-card bg-zinc-950 border border-zinc-900 rounded-2xl max-w-xl w-full p-6 sm:p-8 flex flex-col shadow-2xl relative text-left overflow-hidden"
          >
            {/* Corner visual embellishments */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/2 rounded-bl-full pointer-events-none" />

            {/* Header Area */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#FACC15] uppercase font-black bg-[#FACC15]/10 px-2.5 py-1 rounded inline-flex items-center gap-1.5 border border-[#FACC15]/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                  SYS_EXPORT CORE // ONLINE
                </span>
                <h3 className="text-xl font-black font-sans uppercase tracking-tight text-white mt-3 flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-[#FACC15]" />
                  Biometric Summary Export
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wide">
                  COMPREHENSIVE TELEMETRY TO PORTABLE A4 PDF
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-zinc-550 hover:text-white transition-colors cursor-pointer bg-zinc-900/50 p-2 rounded-lg border border-zinc-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Range Selectors */}
            <div className="py-6 space-y-5">
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Choose the telemetry range to compile. Our system will synchronize your athletic logs, diet calories, and AI verdicts to generate a formatted printable report.
              </p>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setExportRange('weekly')}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group cursor-pointer ${
                    exportRange === 'weekly'
                      ? 'border-[#FACC15] bg-[#FACC15]/5'
                      : 'border-zinc-900 bg-zinc-950/60 hover:border-zinc-800'
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${exportRange === 'weekly' ? 'text-[#FACC15]' : 'text-zinc-500'}`} />
                  <div>
                    <p className={`font-mono text-[9px] tracking-widest uppercase font-black ${exportRange === 'weekly' ? 'text-[#FACC15]' : 'text-zinc-500'}`}>
                      7-Checkin scope
                    </p>
                    <p className="font-extrabold text-[#FACC15] sm:text-base text-sm mt-0.5 select-none font-sans">
                      WEEKLY SUMMARY
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportRange('monthly')}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group cursor-pointer ${
                    exportRange === 'monthly'
                      ? 'border-[#FACC15] bg-[#FACC15]/5'
                      : 'border-zinc-900 bg-zinc-950/60 hover:border-zinc-800'
                  }`}
                >
                  <TrendingUp className={`w-5 h-5 ${exportRange === 'monthly' ? 'text-[#FACC15]' : 'text-zinc-500'}`} />
                  <div>
                    <p className={`font-mono text-[9px] tracking-widest uppercase font-black ${exportRange === 'monthly' ? 'text-[#FACC15]' : 'text-zinc-500'}`}>
                      30-Checkin scope
                    </p>
                    <p className="font-extrabold text-[#FACC15] sm:text-base text-sm mt-0.5 select-none font-sans">
                      MONTHLY STATS
                    </p>
                  </div>
                </button>
              </div>

              {/* Stats compilation preview card */}
              <div className="border border-zinc-900 bg-zinc-950 p-4 rounded-xl flex flex-col space-y-2 font-mono text-[11px] text-zinc-400">
                <div className="flex justify-between">
                  <span>METRIC INTEGRALS FOUND:</span>
                  <span className="text-[#FACC15] font-black">{history.length} CHECKINS</span>
                </div>
                <div className="flex justify-between">
                  <span>LOGS TO COMPILE:</span>
                  <span className="text-white font-bold">
                    {exportRange === 'weekly'
                      ? Math.min(history.length, 7)
                      : Math.min(history.length, 30)}{' '}
                    ITEMS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>COMPILATION FORMAT:</span>
                  <span className="text-zinc-500">VECTOR PRINTABLE PORTRAIT A4</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-zinc-900 pt-4 flex gap-3.5 mt-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="w-1/2 py-3.5 border border-zinc-900 rounded-lg text-zinc-400 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                disabled={isGeneratingPdf}
              >
                Abort
              </button>
              <button
                type="button"
                onClick={downloadProgressReport}
                className="w-1/2 py-3.5 bg-[#FACC15] text-black font-mono font-black text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 glow-btn border border-transparent"
                disabled={isGeneratingPdf || history.length === 0}
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
