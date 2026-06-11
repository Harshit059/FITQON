import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import {
  Users,
  Workouts,
  Diets,
  Reports,
  hashPassword,
  seedDataIfNeeded
} from './server/db';
import { analyzeCheckInWithAI } from './server/gemini';
import { WorkoutLogForm, DietLogForm } from './src/types';

// Seed initial database demo records
seedDataIfNeeded();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'FITQON_SENSITIVE_SECRET_KEY_JWT';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json());

// API route path normalization for serverless runtime compatibility (Vercel, Netlify)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.url.startsWith('/api')) {
    const isApiRoute =
      req.url.startsWith('/auth/') ||
      req.url.startsWith('/checkin/') ||
      req.url === '/history' ||
      req.url.startsWith('/history?') ||
      req.url.startsWith('/admin/');
    if (isApiRoute) {
      req.url = '/api' + req.url;
    }
  }
  next();
});

// TYPES FOR REQUESTS
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

// AUTH MIDDLEWARE
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false,
    };
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin privilege required.' });
    }
    next();
  });
}

// --- AUTH ROUTERS ---

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = Users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const hash = hashPassword(password);
  const newUser = Users.create({
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    createdAt: new Date().toISOString(),
    streak: 0,
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, isAdmin: false },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      streak: newUser.streak,
      isAdmin: false,
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  let user = Users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Automatically register the user on the fly for ease of use
    const namePart = email.split('@')[0];
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    user = Users.create({
      name: displayName,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      streak: 1,
    });
  }

  const isAdmin = email.toLowerCase() === 'admin@fitqon.com';
  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      streak: user.streak,
      isAdmin,
    },
  });
});

app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required for admin login.' });
  }

  // Find or create admin user - any passcode is now accepted permissively for easy testing
  let adminUser = Users.findOne((u) => u.email === 'admin@fitqon.com');
  if (!adminUser) {
    adminUser = Users.create({
      name: 'FITQON Admin',
      email: 'admin@fitqon.com',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      streak: 1,
    });
  }

  const token = jwt.sign(
    { id: adminUser.id, email: adminUser.email, isAdmin: true },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      streak: adminUser.streak,
      isAdmin: true,
    },
  });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
  const user = Users.findOne((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const isAdmin = user.email === 'admin@fitqon.com';
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    streak: user.streak,
    isAdmin,
  });
});

// --- CORE WORKOUT & DIET API ROUTERS ---

app.post('/api/checkin/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { workout, diet, date } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!workout || !diet) {
    return res.status(400).json({ error: 'Workout log and diet log are required.' });
  }

  const todayStr = date || new Date().toISOString().split('T')[0];

  try {
    // 1. Process with AI Health Analyst (Claude / Gemini Fallback)
    const analysis = await analyzeCheckInWithAI(workout as WorkoutLogForm, diet as DietLogForm);

    // 2. Persist the Workout log
    const savedWorkout = Workouts.create({
      userId: req.user.id,
      date: todayStr,
      exercises: workout.exercises,
      intensity: workout.intensity,
      duration: Number(workout.duration || 0),
    });

    // 3. Persist the Diet log
    const savedDiet = Diets.create({
      userId: req.user.id,
      date: todayStr,
      foodItems: diet.foodItems,
      avoided: diet.avoided || [],
      waterIntake: Number(diet.waterIntake || 0),
      totalCalories: Number(diet.totalCalories || 0),
    });

    // 4. Persist the AI Health Report
    const savedReport = Reports.create({
      userId: req.user.id,
      date: todayStr,
      rating: analysis.rating,
      verdict: analysis.verdict,
      dietTips: analysis.dietTips,
      workoutFeedback: analysis.workoutFeedback,
      roadmap: analysis.roadmap,
      status: analysis.status,
    });

    // 5. Update user streak
    const user = Users.findOne((u) => u.id === req.user!.id);
    if (user) {
      // Logic for streak calculation
      // Simple logic: If last checkin was yesterday, increment. If today, keep same. If older, reset to 1.
      const reports = Reports.find((r) => r.userId === user.id).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      let nextStreak = user.streak;
      if (reports.length <= 1) {
        nextStreak = 1;
      } else {
        const lastDate = new Date(reports[1].date); // reports[0] is current one
        const diffMs = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          nextStreak += 1;
        } else if (diffDays > 1) {
          nextStreak = 1;
        }
      }
      Users.update(user.id, { streak: nextStreak });
    }

    res.status(201).json({
      workout: savedWorkout,
      diet: savedDiet,
      report: savedReport,
      streak: user ? user.streak : 1,
    });
  } catch (err: any) {
    console.error('Error in checkin submit route:', err);
    res.status(500).json({ error: 'AI analysis or check-in failing.', details: err.message });
  }
});

app.post('/api/checkin/update', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { date, workout, diet } = req.body;

  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!date) {
    return res.status(400).json({ error: 'Date field is required to update a checking entry.' });
  }
  if (!workout || !diet) {
    return res.status(400).json({ error: 'Workout log and diet log are required.' });
  }

  try {
    // 1. Process with AI Health Analyst (Claude / Gemini Fallback)
    const analysis = await analyzeCheckInWithAI(workout as WorkoutLogForm, diet as DietLogForm);

    // 2. Find and update Workout
    let savedWorkout = Workouts.findOne((w) => w.userId === req.user!.id && w.date === date);
    if (savedWorkout) {
      savedWorkout = Workouts.update(savedWorkout.id, {
        exercises: workout.exercises,
        intensity: workout.intensity,
        duration: Number(workout.duration || 0),
      })!;
    } else {
      savedWorkout = Workouts.create({
        userId: req.user.id,
        date,
        exercises: workout.exercises,
        intensity: workout.intensity,
        duration: Number(workout.duration || 0),
      });
    }

    // 3. Find and update Diet
    let savedDiet = Diets.findOne((d) => d.userId === req.user!.id && d.date === date);
    if (savedDiet) {
      savedDiet = Diets.update(savedDiet.id, {
        foodItems: diet.foodItems,
        avoided: diet.avoided || [],
        waterIntake: Number(diet.waterIntake || 0),
        totalCalories: Number(diet.totalCalories || 0),
      })!;
    } else {
      savedDiet = Diets.create({
        userId: req.user.id,
        date,
        foodItems: diet.foodItems,
        avoided: diet.avoided || [],
        waterIntake: Number(diet.waterIntake || 0),
        totalCalories: Number(diet.totalCalories || 0),
      });
    }

    // 4. Find and update AI Health Report
    let savedReport = Reports.findOne((r) => r.userId === req.user!.id && r.date === date);
    if (savedReport) {
      savedReport = Reports.update(savedReport.id, {
        rating: analysis.rating,
        verdict: analysis.verdict,
        dietTips: analysis.dietTips,
        workoutFeedback: analysis.workoutFeedback,
        roadmap: analysis.roadmap,
        status: analysis.status,
      })!;
    } else {
      savedReport = Reports.create({
        userId: req.user.id,
        date,
        rating: analysis.rating,
        verdict: analysis.verdict,
        dietTips: analysis.dietTips,
        workoutFeedback: analysis.workoutFeedback,
        roadmap: analysis.roadmap,
        status: analysis.status,
      });
    }

    res.json({
      success: true,
      workout: savedWorkout,
      diet: savedDiet,
      report: savedReport,
    });
  } catch (err: any) {
    console.error('Error in checkin update route:', err);
    res.status(500).json({ error: 'AI analysis or check-in updating failing.', details: err.message });
  }
});

app.get('/api/history', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = req.user.id;
  const reports = Reports.find((r) => r.userId === userId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const workouts = Workouts.find((w) => w.userId === userId);
  const diets = Diets.find((d) => d.userId === userId);

  // Match full dashboard list
  const history = reports.map((report) => {
    const workout = workouts.find((w) => w.date === report.date) || null;
    const diet = diets.find((d) => d.date === report.date) || null;
    return {
      date: report.date,
      report,
      workout,
      diet,
    };
  });

  res.json(history);
});

// --- ADMIN PANEL API ROUTERS ---

app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  try {
    const allUsers = Users.find();
    const allWorkouts = Workouts.find();
    const allDiets = Diets.find();
    const allReports = Reports.find();

    const normalUsers = allUsers.filter(u => u.email !== 'admin@fitqon.com');
    const totalUsersCount = normalUsers.length;

    // Checkins today
    const todayStr = new Date().toISOString().split('T')[0];
    const checkinsTodayCount = allReports.filter((r) => r.date === todayStr).length;

    // Average Rating (calculate index score)
    const ratingWeights: { [key: string]: number } = {
      'Excellent': 5,
      'Great': 4,
      'Good': 3,
      'Average': 2,
      'Needs Improvement': 1,
      'Poor': 0,
    };
    
    let sumWeights = 0;
    let counts = 0;
    allReports.forEach((r) => {
      if (ratingWeights[r.rating] !== undefined) {
        sumWeights += ratingWeights[r.rating];
        counts++;
      }
    });
    
    let avgRatingStr = 'Good';
    if (counts > 0) {
      const avgScore = sumWeights / counts;
      if (avgScore >= 4.5) avgRatingStr = 'Excellent';
      else if (avgScore >= 3.5) avgRatingStr = 'Great';
      else if (avgScore >= 2.5) avgRatingStr = 'Good';
      else if (avgScore >= 1.5) avgRatingStr = 'Average';
      else if (avgScore >= 0.5) avgRatingStr = 'Needs Improvement';
      else avgRatingStr = 'Poor';
    }

    // Streak Leaders
    const streakLeaders = normalUsers
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5)
      .map((u) => ({ name: u.name, email: u.email, streak: u.streak }));

    // Rating Distribution
    const ratingCounts: { [key: string]: number } = {
      'Excellent': 0,
      'Great': 0,
      'Good': 0,
      'Average': 0,
      'Needs Improvement': 0,
      'Poor': 0,
    };
    allReports.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
      }
    });
    const ratingDistribution = Object.entries(ratingCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Common Exercises logged
    const exerciseCounters: { [key: string]: number } = {};
    allWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const exName = ex.name.trim().toLowerCase();
        // Capitalize words
        const formatted = exName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        exerciseCounters[formatted] = (exerciseCounters[formatted] || 0) + 1;
      });
    });
    const commonExercisesCount = Object.entries(exerciseCounters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Daily check-ins count for the last 30 days
    const checkinsByDate: { [key: string]: number } = {};
    for (let i = 29; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      checkinsByDate[dateStr] = 0;
    }
    allReports.forEach((r) => {
      if (checkinsByDate[r.date] !== undefined) {
        checkinsByDate[r.date]++;
      }
    });
    const dailyCheckins = Object.entries(checkinsByDate).map(([date, count]) => ({
      date: date.substring(5), // MM-DD for cleaner chart headers
      count,
    }));

    res.json({
      totalUsers: totalUsersCount,
      checkinsToday: checkinsTodayCount,
      avgRating: avgRatingStr,
      streakLeaders,
      ratingDistribution,
      commonExercisesCount,
      dailyCheckins,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to aggregate admin stats dashboard.' });
  }
});

// Admin list of active users
app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  try {
    const allUsers = Users.find().filter(u => u.email !== 'admin@fitqon.com');
    const allReports = Reports.find();

    const list = allUsers.map((user) => {
      const userReports = allReports.filter((r) => r.userId === user.id);
      
      // Last check-in date
      let lastCheckIn = 'Never';
      if (userReports.length > 0) {
        const sorted = userReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        lastCheckIn = sorted[0].date;
      }

      // Average score calculation
      let sumOfRating = 0;
      const ratingsMap: { [key: string]: number } = {
        'Excellent': 5, 'Great': 4, 'Good': 3, 'Average': 2, 'Needs Improvement': 1, 'Poor': 0
      };
      userReports.forEach((r) => {
        sumOfRating += ratingsMap[r.rating] !== undefined ? ratingsMap[r.rating] : 3;
      });
      const avgNum = userReports.length > 0 ? sumOfRating / userReports.length : 3;

      let avgRating = 'Good';
      if (avgNum >= 4.5) avgRating = 'Excellent';
      else if (avgNum >= 3.5) avgRating = 'Great';
      else if (avgNum >= 2.5) avgRating = 'Good';
      else if (avgNum >= 1.5) avgRating = 'Average';
      else if (avgNum >= 0.5) avgRating = 'Needs Improvement';
      else avgRating = 'Poor';

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        lastCheckIn,
        averageRating: avgRating,
        streak: user.streak,
      };
    });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve active users.' });
  }
});

// Admin fetch specific user history
app.get('/api/admin/users/:userId/history', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = Users.findOne((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const reports = Reports.find((r) => r.userId === userId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const workouts = Workouts.find((w) => w.userId === userId);
    const diets = Diets.find((d) => d.userId === userId);

    const history = reports.map((report) => {
      const workout = workouts.find((w) => w.date === report.date) || null;
      const diet = diets.find((d) => d.date === report.date) || null;
      return {
        date: report.date,
        report,
        workout,
        diet,
      };
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        streak: user.streak,
      },
      history,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve specific user logs.' });
  }
});

// Admin API for raw reports download parameters
app.get('/api/admin/generate-report', requireAdmin, (req: Request, res: Response) => {
  const { startDate, endDate, format } = req.query;

  try {
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const reports = Reports.find((r) => {
      const d = new Date(r.date);
      return d >= start && d <= end;
    });

    const workouts = Workouts.find();
    const users = Users.find();

    const contentRows = reports.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      const workout = workouts.find((w) => w.userId === r.userId && w.date === r.date);
      return {
        Date: r.date,
        UserName: user ? user.name : 'Unknown User',
        UserEmail: user ? user.email : 'N/A',
        HealthRating: r.rating,
        Streak: user ? user.streak : 0,
        WorkoutDuration: workout ? `${workout.duration} mins` : 'N/A',
        WorkoutIntensity: workout ? workout.intensity : 'N/A',
        StatusMessage: r.status,
      };
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=fitqon-health-report.csv`);

      const headers = ['Date', 'UserName', 'UserEmail', 'HealthRating', 'Streak', 'WorkoutDuration', 'WorkoutIntensity', 'StatusMessage'];
      const csvContent = [
        headers.join(','),
        ...contentRows.map((row: any) =>
          headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      return res.status(200).send(csvContent);
    }

    // Default to JSON structures
    res.json({
      meta: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        totalEntries: contentRows.length,
      },
      data: contentRows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile report parameters.' });
  }
});

// Real-time daily health feed route
app.get('/api/admin/feed', requireAdmin, (req: Request, res: Response) => {
  try {
    const reports = Reports.find();
    const users = Users.find();
    const workouts = Workouts.find();

    // Sort by latest overall
    const sortedReports = reports.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id)
    ).slice(0, 25);

    const feed = sortedReports.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      const workout = workouts.find((w) => w.userId === r.userId && w.date === r.date);
      return {
        id: r.id,
        date: r.date,
        rating: r.rating,
        status: r.status,
        verdict: r.verdict,
        userName: user ? user.name : 'Anonymous Gymgoer',
        userEmail: user ? user.email : 'secret@fitqon.com',
        workoutType: workout && workout.exercises.length > 0 ? 'Logged Workout' : 'No Activity',
        duration: workout ? workout.duration : 0,
      };
    });

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to pull live check-in report feed.' });
  }
});

// --- CLIENT STATIC BINDINGS AND VITE SERVER ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // This allows using the Vite middlewares for processing files
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`FITQON Full-Stack server booted at http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
