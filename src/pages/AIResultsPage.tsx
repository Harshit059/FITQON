import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import {
  Apple,
  Droplet,
  Beef,
  Fish,
  Flame,
  AlertTriangle,
  Ban,
  Coffee,
  TrendingDown,
  Activity,
  CheckSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  ArrowLeft,
  Download
} from 'lucide-react';

export default function AIResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Read from session storage
    const raw = sessionStorage.getItem('fitqon_current_report');
    if (raw) {
      setData(JSON.parse(raw));
    } else {
      // Create John Doe's beautiful default demonstration report if accessed directly
      setData({
        workout: {
          exercises: [{ name: 'Deep Squats', sets: 4, reps: 10, weight: '100kg' }],
          intensity: 'Intense',
          duration: 50,
        },
        diet: {
          foodItems: [
            { name: 'Oatmeal & Honey bowl', calories: 350, quantity: '1 bowl', mealType: 'breakfast' },
            { name: 'Grilled Salmon with Rice', calories: 700, quantity: '1 plate', mealType: 'lunch' },
          ],
          avoided: ['sugary juices', 'junk food'],
          waterIntake: 2.8,
          totalCalories: 1050,
        },
        report: {
          rating: 'Excellent',
          verdict:
            "Your workout today was fantastic—handling deep lifting squats with focused reps is incredible. Your nutrition is dialed in with lean protein and highly hydrated statistics. Mind your evening recovery hours to maximize physical hypertrophy.",
          dietTips: {
            add: [
              { icon: 'Beef', title: 'Lean Proteins', explanation: 'Sustains optimal recovery for muscle groups post progressive squats.' },
              { icon: 'Droplet', title: 'Liquid Minerals', explanation: 'Aim to cross 3.0L with magnesium blends to prevent leg cramps.' }
            ],
            avoid: [
              { icon: 'Ban', title: 'Carbonated Sweets', explanation: 'Carbonated inputs inflate gastric lines which lower protein digestion rates.' },
              { icon: 'AlertTriangle', title: 'Late-Night Snacks', explanation: 'Ingesting heavy food blocks circadian fat burning processes.' }
            ],
          },
          workoutFeedback: {
            good: 'Outstanding volume and high exercise density. Logging compound squats is highly competitive.',
            improve: 'Limit active resting phases between compound lifts to 90 seconds flat.',
            nextWorkout: 'Core Pull focus: Deadlifts, Pull-ups, and Seated Cabling.',
          },
          roadmap: [
            { day: 1, title: 'Glycogen Fueling', description: 'Center major calories around 2h training window.' },
            { day: 2, title: 'Active Yoga Flex', description: 'Allocate 15 minutes of lower base stretches.' },
            { day: 3, title: 'Zone 2 Run', description: 'Complete 30 minutes of steady fat loss cardio.' },
            { day: 4, title: 'Compound Strength Base', description: 'Focus on progressive set adjustments on bench presses.' },
            { day: 5, title: 'Deep Hydration Metrics', description: 'Aim for 3.2L pristine water with electrolyte tracking.' },
            { day: 6, title: 'Clean Whole Foods Only', description: 'Avoid gluten or dairy variables for 24h.' },
            { day: 7, title: 'Full Physique Checkin', description: 'Weigh in and finalize results reports inside FITQON.' }
          ],
          status: 'Normal ✓',
        },
      });
    }
  }, []);

  if (!data) return null;

  const { workout, diet, report } = data;

  const renderLucideIcon = (iconName: string) => {
    switch (iconName) {
      case 'Apple':
        return <Apple className="w-5 h-5 text-[#FACC15]" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'Beef':
        return <Beef className="w-5 h-5 text-orange-400" />;
      case 'Fish':
        return <Fish className="w-5 h-5 text-sky-450 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-[#FACC15]" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'Ban':
        return <Ban className="w-5 h-5 text-red-400" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-yellow-600" />;
      case 'TrendingDown':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-[#FACC15]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#FACC15]" />;
    }
  };

  const getBadgeBgColors = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-[#FACC15] text-black ring-[#FACC15]/20';
      case 'Great':
        return 'bg-zinc-900 text-[#FACC15] ring-[#FACC15]/10 border border-[#FACC15]/40';
      case 'Good':
        return 'bg-zinc-800 text-zinc-100 ring-zinc-800 border border-zinc-700';
      case 'Average':
        return 'bg-zinc-900 text-zinc-400 ring-zinc-900 border border-zinc-800';
      case 'Needs Improvement':
        return 'bg-red-950/50 text-red-400 ring-red-950/30 border border-red-900/50';
      default:
        return 'bg-red-950 text-red-500 ring-red-950/25 border border-red-900';
    }
  };

  const getStatusPillColors = (status: string) => {
    if (status.includes('Normal') || status.includes('✓')) {
      return 'bg-emerald-950/55 text-emerald-400 border border-emerald-900/60';
    } else if (status.includes('Improve') || status.includes('↑')) {
      return 'bg-amber-950/55 text-amber-400 border border-amber-900/60';
    } else {
      return 'bg-red-950/55 text-red-400 border border-red-900/60';
    }
  };

  const downloadReport = () => {
    if (!data) return;
    const { workout, diet, report } = data;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm
    const margin = 15;
    const maxTextWidth = pageWidth - (margin * 2); // ~180mm

    let y = 15;

    // Helper to draw a sleek, high-tech athletic/telemetry vector logo of FITQON
    const drawFitqonLogo = (logoX: number, logoY: number, size: number) => {
      // Dark tech backing
      doc.setFillColor(18, 18, 21); // sleek dark zinc
      doc.rect(logoX, logoY, size, size, 'F');

      // Bright yellow framing brackets (#FACC15 solid brand color)
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

      // Outer rings of modern circular telemetry compass
      doc.setDrawColor(250, 204, 21);
      doc.setLineWidth(0.65);
      doc.circle(cx, cy, r, 'S');

      // Central glowing core
      doc.setFillColor(250, 204, 21);
      doc.circle(cx, cy, r * 0.35, 'F');

      // Q diagonal lightning slash (Athletic speed line)
      doc.setDrawColor(250, 204, 21);
      doc.setLineWidth(1.3);
      doc.line(cx + (r * 0.2), cy + (r * 0.2), cx + (r * 1.5), cy + (r * 1.5));

      // Telemetry radar crosshair accents (White lines)
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.35);
      doc.line(cx - (r * 1.4), cy, cx - (r * 0.7), cy);
      doc.line(cx + (r * 0.7), cy, cx + (r * 1.4), cy);
      doc.line(cx, cy - (r * 1.4), cx, cy - (r * 0.7));
      doc.line(cx, cy + (r * 0.7), cx, cy + (r * 1.4));
    };

    // Helper to request more space with graceful page splitting
    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
        y = 25;
      }
    };

    // Header drawing for subsequent pages
    const drawPageHeader = () => {
      // Small watermark logo
      drawFitqonLogo(margin, 8, 8);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(115, 115, 115);
      doc.text('FITQON // ATHLETIC TELEMETRY DIAGNOSTICS', margin + 11, 12);
      
      doc.setFont('Helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, 12);
      
      // Fine neutral separator rule
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.line(margin, 18, pageWidth - margin, 18);
    };

    // Helper to render high-fidelity sub-section labels
    const drawSectionHeader = (title: string) => {
      ensureSpace(18);
      y += 4;
      // Yellow indicator badge
      doc.setFillColor(250, 204, 21); // #FACC15 solid branding
      doc.rect(margin, y, 3, 5, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(9, 9, 11); // deep charcoal dark
      doc.text(title.toUpperCase(), margin + 6, y + 4);

      y += 7;
      doc.setDrawColor(244, 244, 245);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    // Paragraph wrap helper
    const printParagraph = (text: string, fontSize = 9.5, isBold = false, textColor = [63, 63, 70], leading = 5) => {
      if (!text) return;
      doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const lines: string[] = doc.splitTextToSize(text, maxTextWidth);
      lines.forEach((line) => {
        ensureSpace(leading + 1);
        doc.text(line, margin, y);
        y += leading;
      });
      y += 1.5;
    };

    // FIRST PAGE BANNER
    doc.setFillColor(9, 9, 11); // black backdrop
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Branding border
    doc.setFillColor(250, 204, 21);
    doc.rect(0, 39, pageWidth, 1, 'F');

    // Draw unique high-tech vector logo in the header
    drawFitqonLogo(margin, 10, 20);

    // Title info shifted right to align with the logo
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('FITQON ATHLETIC CLINIC', margin + 24, 18);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(161, 161, 170);
    doc.text('AI TELEMETRY OPTIMIZATION & DIAGNOSTICS REPORT', margin + 24, 24);

    // Diagnostics logo details / Date on right
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(250, 204, 21);
    doc.text('// COGNITIVE RECON V2', pageWidth - margin - 45, 17);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(255, 255, 255);
    doc.text(`DT-FILLED : ${new Date().toLocaleDateString()}`, pageWidth - margin - 45, 23);
    doc.text(`SYSTEM-UTC: ${new Date().toUTCString().slice(17, 25)}`, pageWidth - margin - 45, 28);

    y = 52;

    // ATHLETE RATING OVERVIEW CARD
    ensureSpace(28);
    doc.setFillColor(244, 244, 245); // light-grey banner
    doc.rect(margin, y, maxTextWidth, 22, 'F');

    doc.setFillColor(250, 204, 21); // brand left block line
    doc.rect(margin, y, 2.5, 22, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text('ATHLETE HEALTH COEFFICIENT', margin + 7, y + 6);
    doc.text('COGNITIVE COGNIZANCE STATUS', margin + 110, y + 6);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text(String(report.rating).toUpperCase(), margin + 7, y + 15);
    doc.text(String(report.status).toUpperCase(), margin + 110, y + 15);

    y += 30;

    // SECTION 1: CRITICAL CONSOLE VERDICT
    drawSectionHeader('1. Critical Console Verdict');
    printParagraph(report.verdict, 10, false, [39, 39, 42], 5);
    y += 3;

    // SECTION 2: PERFORMANCE TELEMETRY DATA
    drawSectionHeader('2. Metric & Telemetry Logs');
    
    // Simple 4-Column Grid
    ensureSpace(20);
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, y, maxTextWidth, 16, 'F');
    doc.setDrawColor(228, 228, 231);
    doc.setLineWidth(0.25);
    doc.rect(margin, y, maxTextWidth, 16, 'D');

    // column separation lines
    doc.line(margin + 45, y, margin + 45, y + 16);
    doc.line(margin + 90, y, margin + 90, y + 16);
    doc.line(margin + 135, y, margin + 135, y + 16);

    doc.setFontSize(7.5);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(113, 113, 122);
    doc.text('DURATION', margin + 4, y + 5);
    doc.text('INTENSITY', margin + 49, y + 5);
    doc.text('HYDRATION TOTAL', margin + 94, y + 5);
    doc.text('CALORIE INTAKE', margin + 139, y + 5);

    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc.text(`${workout.duration} min`, margin + 4, y + 11);
    doc.text(`${workout.intensity}`, margin + 49, y + 11);
    doc.text(`${diet.waterIntake} Liters`, margin + 94, y + 11);
    doc.text(`${diet.totalCalories} kcal`, margin + 139, y + 11);

    y += 22;

    // Workout Exercises Subtitle
    ensureSpace(12);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc.text('COMPLETED EXERCISES LOG:', margin, y);
    y += 5.5;

    if (workout?.exercises && workout.exercises.length > 0) {
      workout.exercises.forEach((exc: any, i: number) => {
        const itemLine = `* [${i + 1}] ${exc.name}: ${exc.sets} sets x ${exc.reps} reps (${exc.weight || 'N/A'})`;
        printParagraph(itemLine, 8.5, false, [82, 82, 91], 4.5);
      });
    } else {
      printParagraph('No exercise telemetry items logged during this timeline.', 8.5, false, [120, 120, 125], 4.5);
    }
    y += 4;

    // Diet Food items
    ensureSpace(12);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc.text('NUTRITIONAL FUEL TIMELINE ELEMENTS:', margin, y);
    y += 5.5;

    if (diet?.foodItems && diet.foodItems.length > 0) {
      diet.foodItems.forEach((f: any, i: number) => {
        const foodLine = `* [${String(f.mealType).toUpperCase()}] ${f.name} - ${f.quantity} (${f.calories} kcal)`;
        printParagraph(foodLine, 8.5, false, [82, 82, 91], 4.5);
      });
    } else {
      printParagraph('No raw food intake assets recorded during this timeline.', 8.5, false, [120, 120, 125], 4.5);
    }
    y += 4;

    // SECTION 3: DIETARY VECTOR RECOMMENDATIONS
    drawSectionHeader('3. Biomarker Dietary Advice');

    const addTips = report.dietTips?.add || [];
    const avoidTips = report.dietTips?.avoid || [];

    if (addTips.length > 0) {
      ensureSpace(10);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(22, 101, 52); // green 800
      doc.text('INCREASE & ENHANCE BIO-RESOURCES:', margin, y);
      y += 5.5;

      addTips.forEach((t: any) => {
        const line = `+ [${t.title}]: ${t.explanation}`;
        printParagraph(line, 8.5, false, [63, 63, 70], 4.5);
      });
    }
    y += 2;

    if (avoidTips.length > 0) {
      ensureSpace(10);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(153, 27, 27); // red 800
      doc.text('MITIGATE & MINIMIZE STRESSORS:', margin, y);
      y += 5.5;

      avoidTips.forEach((t: any) => {
        const line = `- [${t.title}]: ${t.explanation}`;
        printParagraph(line, 8.5, false, [63, 63, 70], 4.5);
      });
    }
    y += 4;

    // SECTION 4: BIOMECHANICAL OPTIMIZATION DECODER
    drawSectionHeader('4. Training & Biomechanical Feedback');

    const goodFed = report.workoutFeedback?.good;
    const improveFed = report.workoutFeedback?.improve;
    const nextFed = report.workoutFeedback?.nextWorkout;

    if (goodFed) {
      ensureSpace(12);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text('COMPLETED BENCHMARKS:', margin, y);
      y += 5;
      printParagraph(goodFed, 8.5, false, [82, 82, 91], 4.5);
      y += 2;
    }

    if (improveFed) {
      ensureSpace(12);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text('TARGET UPGRADE VECTORS:', margin, y);
      y += 5;
      printParagraph(improveFed, 8.5, false, [82, 82, 91], 4.5);
      y += 2;
    }

    if (nextFed) {
      ensureSpace(12);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(24, 24, 27);
      doc.text('FUTURE ATHLETIC LOADOUT SCHEDULE:', margin, y);
      y += 5;
      printParagraph(nextFed, 8.5, false, [82, 82, 91], 4.5);
      y += 2;
    }

    // SECTION 5: 7-DAY INTENSITY ROADMAP
    drawSectionHeader('5. 7-Day Performance Timeline');

    if (report.roadmap && report.roadmap.length > 0) {
      report.roadmap.forEach((r: any) => {
        ensureSpace(16);

        // background card item
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, maxTextWidth, 12, 'F');
        doc.setDrawColor(241, 241, 244);
        doc.rect(margin, y, maxTextWidth, 12, 'D');

        // Draw day marker box
        doc.setFillColor(250, 204, 21);
        doc.rect(margin, y, 14, 12, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(24, 24, 27);
        doc.text(`DAY ${r.day ?? '?'}`, margin + 2, y + 8);

        // Day Title Text
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(39, 39, 42);
        doc.text(String(r.title).toUpperCase(), margin + 17, y + 4.5);

        // Day Description
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(113, 113, 122);
        doc.text(String(r.description), margin + 17, y + 9, { maxWidth: maxTextWidth - 20 });

        y += 14;
      });
    }

    // FINAL SIGN-OFF FOOTER CARD
    ensureSpace(22);
    y += 2;
    doc.setFillColor(24, 24, 27);
    doc.rect(margin, y, maxTextWidth, 14, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(250, 204, 21);
    doc.text('FITQON COGNITION MATRIX — CERTIFIED DIAGNOSTICS DECODER', margin + 5, y + 5.5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(161, 161, 170);
    doc.text('This data has been securely processed locally to maximize physical performance diagnostics indices.', margin + 5, y + 10.5);

    // Dynamic save
    const cleanRating = String(report.rating).replace(/\s+/g, '_');
    doc.save(`FITQON_Diagnostics_Report_${cleanRating}.pdf`);
  };

  return (
    <div className="flex-1 bg-black/40 text-white p-4 sm:p-8 max-w-5xl mx-auto w-full flex flex-col space-y-6 text-left animate-fade-in-up relative z-10">
      
      {/* PREVIOUS SECTION BACK NAV */}
      <div className="flex items-center justify-start">
        <button
          onClick={() => navigate('/dashboard')}
          className="group flex items-center gap-2 border border-zinc-900 bg-zinc-950/60 px-4 py-2.5 rounded-lg text-xs font-mono font-bold text-zinc-300 hover:text-white hover:border-[#FACC15]/30 hover:bg-zinc-950 transition-all cursor-pointer"
          id="btn-back-to-previous-section"
        >
          <ArrowLeft className="w-4 h-4 text-[#FACC15] group-hover:-translate-x-1 transition-transform" />
          <span>← BACK TO CONSOLE</span>
        </button>
      </div>

      {/* HEADER ROW WITH STATUS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FACC15] rounded-full animate-pulse"></span>
            <span className="text-[9px] font-mono tracking-widest text-[#FACC15] uppercase font-black">FITQON AI NETWORK ENGINE</span>
          </div>
          <h2 className="text-3xl font-black font-sans tracking-tight uppercase mt-1">
            ATHLETIC <span className="text-[#FACC15] glow-text">DIAGNOSTICS</span>
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
            Report finalized via deep neural biomechanical cognition model
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadReport}
            className="text-xs font-mono font-bold text-black bg-[#FACC15] hover:bg-[#E2B705] active:translate-y-0.5 uppercase px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-150 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
            id="btn-download-ai-telemetry-report"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD REPORT</span>
          </button>
          <span className={`text-xs font-mono font-black px-4 py-2 rounded-lg ${getStatusPillColors(report.status)} uppercase tracking-wider`}>
            ENGINE STATUS: {report.status}
          </span>
          <Link
            to="/dashboard"
            className="text-xs font-mono text-zinc-305 text-zinc-300 hover:text-white uppercase border border-zinc-900 bg-zinc-950/80 px-4 py-2 rounded-lg hover:border-[#FACC15]/30 transition-all cursor-pointer font-bold duration-200"
          >
            Go Dashboard
          </Link>
        </div>
      </div>

      {/* OVERALL RATING BADGE & VERDICT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Rating reveal box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-4 premium-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FACC15] shadow-[0_0_15px_#FACC15]"></div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black mb-6">ATHLETIC CO-EFFICIENT</span>
          
          <motion.div
            initial={{ rotate: -5, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-xl ring-4 ring-zinc-900/60 transition-all ${getBadgeBgColors(report.rating)}`}
          >
            <Activity className="w-6 h-6 mb-1.5 animate-pulse" />
            <span className="text-xl font-black font-mono tracking-tighter uppercase leading-none">{report.rating}</span>
            <span className="text-[8px] font-mono uppercase tracking-widest mt-1.5 opacity-80 font-black">FITQON CORE</span>
          </motion.div>

          <span className="text-[9px] font-mono text-[#FACC15] mt-6 uppercase tracking-widest bg-[#FACC15]/10 px-3 py-1.5 rounded-full border border-[#FACC15]/20 font-black">
            STABLE METRICS ENGINE
          </span>
        </motion.div>

        {/* Verdict box */}
        <div className="md:col-span-8 premium-card p-6 sm:p-8 rounded-2xl flex flex-col justify-center relative">
          <div className="absolute top-5 right-5 text-[9px] font-mono text-[#FACC15] uppercase flex items-center gap-1.5 font-bold bg-[#FACC15]/10 border border-[#FACC15]/20 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#FACC15] fill-current animate-pulse" /> DIAGNOSTICS: LIVE
          </div>
          <h3 className="text-sm font-black font-mono tracking-widest uppercase mb-4 text-[#FACC15]">
            NEURAL REHABILITATION ANALYSIS VERDICT
          </h3>
          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-sans pr-6">
            "{report.verdict}"
          </p>
          <div className="mt-6 pt-5 border-t border-zinc-900 flex flex-wrap gap-5 text-[11px] font-mono text-zinc-400 font-bold">
            <span className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">🏋️ TRAINING: <strong className="text-[#FACC15]">{workout.duration}m</strong> ({workout.intensity})</span>
            <span className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">💧 WATER COEF: <strong className="text-[#FACC15]">{diet.waterIntake}L</strong></span>
            <span className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">🍽️ CALORIE DEF: <strong className="text-[#FACC15]">{diet.totalCalories} kcal</strong></span>
          </div>
        </div>
      </div>

      {/* DIET RECOMMENDATIONS SIDE BY SIDE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ADD COLUMN */}
        <div className="premium-card p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Apple className="w-5 h-5 text-[#FACC15]" />
            <h4 className="text-xs font-black font-mono uppercase tracking-widest text-[#FACC15]">
              OPTIMIZE & BOOST INTAKE
            </h4>
          </div>

          <div className="space-y-3.5">
            {report.dietTips?.add?.map((tip: any, idx: number) => (
              <div key={idx} className="bg-zinc-950/80 border border-zinc-900/60 p-4 rounded-xl flex gap-4 hover:border-[#FACC15]/10 transition-all">
                <div className="w-10 h-10 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-inner">
                  {renderLucideIcon(tip.icon)}
                </div>
                <div>
                  <span className="block text-xs font-mono font-black text-[#FACC15] uppercase tracking-wider">{tip.title}</span>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-medium">{tip.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AVOID COLUMN */}
        <div className="premium-card p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Ban className="w-5 h-5 text-red-400" />
            <h4 className="text-xs font-black font-mono uppercase tracking-widest text-red-400">
              MITIGATE & LIMIT TRIGGERS
            </h4>
          </div>

          <div className="space-y-3.5">
            {report.dietTips?.avoid?.map((tip: any, idx: number) => (
              <div key={idx} className="bg-zinc-950/80 border border-zinc-900/60 p-4 rounded-xl flex gap-4 hover:border-red-950/40 transition-all">
                <div className="w-10 h-10 shrink-0 bg-red-950/10 border border-red-900/20 rounded-xl flex items-center justify-center">
                  {renderLucideIcon(tip.icon)}
                </div>
                <div>
                  <span className="block text-xs font-mono font-black text-red-400 uppercase tracking-wider">{tip.title}</span>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed font-medium">{tip.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WORKOUT FEEDBACK DETAILS */}
      <div className="premium-card p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3.5">
          <Dumbbell className="w-5 h-5 text-[#FACC15]" />
          <h4 className="text-xs font-black font-mono uppercase tracking-widest text-[#FACC15]">
            TRAINING OPTIMIZATION DECODER
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2">
            <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400 font-black block">✓ COMPLETED BENCHMARKS</span>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{report.workoutFeedback?.good}</p>
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2">
            <span className="text-[9px] font-mono tracking-widest uppercase text-amber-500 font-black block">⚡ UPGRADE VECTOR</span>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">{report.workoutFeedback?.improve}</p>
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2">
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#FACC15] font-black block">📅 FUTURE ATHLETIC SCHEDULER</span>
            <p className="text-xs text-[#FACC15] leading-relaxed font-black uppercase tracking-wider">{report.workoutFeedback?.nextWorkout}</p>
          </div>
        </div>
      </div>

      {/* HEALTH ROADMAP 7-DAY TIMELINE */}
      <div className="premium-card p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3.5">
          <CheckSquare className="w-5 h-5 text-[#FACC15]" />
          <h4 className="text-xs font-black font-mono uppercase tracking-widest text-[#FACC15]">
            INDIVIDUAL 7-DAY INTENSITY ROADMAP
          </h4>
        </div>

        {/* Horizontal Timeline flow */}
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-4 pt-1.5">
          {report.roadmap?.map((plan: any, idx: number) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-900/60 p-4 rounded-xl flex flex-col justify-between space-y-3 group hover:border-[#FACC15]/30 hover:shadow-lg hover:shadow-[#FACC15]/5 transition-all text-left duration-200 cursor-default"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                <span className="text-[9px] font-mono bg-[#FACC15] text-black font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  D{plan.day || (idx + 1)}
                </span>
                <span className="text-[8px] font-mono text-zinc-400 uppercase font-black">STG {idx + 1}</span>
              </div>
              <p className="text-xs font-black font-sans text-zinc-100 uppercase tracking-normal group-hover:text-[#FACC15] transition-colors leading-tight min-h-[30px]">
                {plan.title}
              </p>
              <p className="text-[10px] text-zinc-400 leading-normal line-clamp-3 font-medium">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
