import { GoogleGenAI, Type } from '@google/genai';
import { WorkoutLogForm, DietLogForm } from '../src/types';

// Initialize the Google Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Prompt generator for the Fitness and Diet AI Analyst
function builderPrompt(workout: WorkoutLogForm, diet: DietLogForm): string {
  return `You are FITQON's premium AI Health & Exercise Coach. Analyze today's workout log and diet log, and provide a comprehensive structured health report in strictly JSON format.

WORKOUT DATA FOR TODAY:
- Exercises Logged: ${JSON.stringify(workout.exercises)}
- Intensity Level: ${workout.intensity}
- Total Duration: ${workout.duration} mins

DIET DATA FOR TODAY:
- Foods Consumed: ${JSON.stringify(diet.foodItems)}
- Total Calorie Intake: ${diet.totalCalories} kcal
- Foods/Habits Avoided Successfully: ${JSON.stringify(diet.avoided)}
- Water Intake: ${diet.waterIntake} Litres

You MUST return a JSON object with this exact typescript shape:
{
  "rating": "Excellent" | "Great" | "Good" | "Average" | "Needs Improvement" | "Poor",
  "verdict": "A concise 2-3 sentence summary evaluating the day and providing direct motivation.",
  "dietTips": {
    "add": [
       { "icon": "Apple" | "Droplet" | "Beef" | "Flame" | "Fish", "title": "A short food heading", "explanation": "Full 1-sentence explanation of why they need this" }
    ],
    "avoid": [
       { "icon": "AlertTriangle" | "Ban" | "TrendingDown" | "Coffee", "title": "Avoid category heading", "explanation": "Full 1-sentence explanation why to reduce this" }
    ]
  },
  "workoutFeedback": {
    "good": "Specific positive feedback about what they did well in their exercises today.",
    "improve": "One specific target area/form/reps scheme to improve in the next session.",
    "nextWorkout": "Specific exercises or workout regime recommended for their next gym visit."
  },
  "roadmap": [
    { "day": 1, "title": "Day 1 Action Item Title", "description": "Short explanation of the day 1 task" },
    { "day": 2, "title": "Day 2 Action Item Title", "description": "Short explanation of the day 2 task" },
    { "day": 3, "title": "Day 3 Action Item Title", "description": "Short explanation of the day 3 task" },
    { "day": 4, "title": "Day 4 Action Item Title", "description": "Short explanation of the day 4 task" },
    { "day": 5, "title": "Day 5 Action Item Title", "description": "Short explanation of the day 5 task" },
    { "day": 6, "title": "Day 6 Action Item Title", "description": "Short explanation of the day 6 task" },
    { "day": 7, "title": "Day 7 Action Item Title", "description": "Short explanation of the day 7 task" }
  ],
  "status": "Normal ✓" | "Can Improve ↑" | "Needs Attention ⚠"
}

Formatting and Constraint Rules:
- CRITICAL ZERO/LOW CALORIE RULE: If the user logs 0 calories or extremely low food intake (e.g., < 800 kcal total for the day), DO NOT give an 'Excellent' or 'Great' rating. Food intake of 0 indicates either a severe fasting risk or incomplete logging. Grade this as 'Needs Improvement' or 'Average', flag status as 'Needs Attention ⚠', and explain constructive feedback to consume adequate macronutrients or complete their food logs.
- VARIATION FRIENDLY RULE: If the user changes exercises daily (e.g., Back and Biceps on one day, Chest on another), do NOT penalize or lower score for exercise variation. Variation is excellent for muscle recovery and periodization. Adapt your feedback positively to support their group split rotation.
- CARDIO ESTIMATION INTEGRITY RULE: If exercises contain 'caloriesBurned' parameters, explicitly reference their active metabolic rate or estimated active calories (e.g., walking, running) within your verdict or workout feedback. Provide smart coaching advice connecting their calculated active cardio cardiorespiratory exertion with their direct caloric/energy intake.
- Under dietTips.add (provide 2 items) and dietTips.avoid (provide 2 items). Use valid Lucide icons from this list: Apple, Droplet, Beef, Fish, Flame, AlertTriangle, Ban, Coffee, TrendingDown.
- Under roadmap, you must provide exactly 7 day-by-day sequential items covering a realistic roadmap to accelerate fitness, custom-tailored to their workout logs (duration, exercises) and diet intake.
- Make the tone authoritative, technical, high-performance, and supportive.
- Return ONLY the JSON. No markdown backticks, no explanatory preamble. Start with '{' and end with '}'.`;
}

// Call Claude API if ANTHROPIC_API_KEY is supplied, otherwise fallback to Gemini
export async function analyzeCheckInWithAI(
  workout: WorkoutLogForm,
  diet: DietLogForm
): Promise<any> {
  const prompt = builderPrompt(workout, diet);
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    try {
      console.log('Using Anthropic Claude API for health analysis...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022', // Standard Claude 3.5 Sonnet name
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      const contentText = data.content?.[0]?.text || '';
      
      // Attempt to clean and parse the response JSON
      const jsonStart = contentText.indexOf('{');
      const jsonEnd = contentText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(contentText.slice(jsonStart, jsonEnd));
      }
      return JSON.parse(contentText);
    } catch (err) {
      console.error('Claude API failed or returned imperfect JSON. Falling back to Gemini...', err);
    }
  }

  // Fallback / Default AI Core using Google Gemini API
  console.log('Using Gemini API (gemini-3.5-flash) for FITQON health analysis...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['rating', 'verdict', 'dietTips', 'workoutFeedback', 'roadmap', 'status'],
          properties: {
            rating: {
              type: Type.STRING,
              description: 'Rating option: Excellent, Great, Good, Average, Needs Improvement, Poor',
            },
            verdict: { type: Type.STRING },
            dietTips: {
              type: Type.OBJECT,
              required: ['add', 'avoid'],
              properties: {
                add: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['icon', 'title', 'explanation'],
                    properties: {
                      icon: { type: Type.STRING },
                      title: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                  },
                },
                avoid: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['icon', 'title', 'explanation'],
                    properties: {
                      icon: { type: Type.STRING },
                      title: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            workoutFeedback: {
              type: Type.OBJECT,
              required: ['good', 'improve', 'nextWorkout'],
              properties: {
                good: { type: Type.STRING },
                improve: { type: Type.STRING },
                nextWorkout: { type: Type.STRING },
              },
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['day', 'title', 'description'],
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            status: {
              type: Type.STRING,
              description: 'Status: Normal ✓, Can Improve ↑, Needs Attention ⚠',
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    return parsedData;
  } catch (err) {
    console.error('Gemini API analysis failed, compiling backup report...', err);
    // Return high quality hardcoded model response if both offline
    return getBackupReport(workout, diet);
  }
}

function getBackupReport(workout: WorkoutLogForm, diet: DietLogForm): any {
  let score = 0;

  // Workout duration score
  if (workout.duration >= 30) {
    score += 35;
  } else if (workout.duration > 0) {
    score += 15;
  }

  // Water intake score
  if (diet.waterIntake >= 2.5) {
    score += 25;
  } else if (diet.waterIntake >= 1.5) {
    score += 15;
  } else if (diet.waterIntake > 0) {
    score += 5;
  }

  // Calorie score: Healthy goals are between 1200 and 3200 kcal. Below 800 is a hazard indicator or empty state.
  let calorieScore = 0;
  if (diet.totalCalories >= 1500 && diet.totalCalories <= 2800) {
    calorieScore = 40;
  } else if (diet.totalCalories >= 800 && diet.totalCalories < 1500) {
    calorieScore = 25;
  } else if (diet.totalCalories > 2800) {
    calorieScore = 20; // safe surplus
  } else {
    // Under 800 (including 0 kcal)
    calorieScore = 0; // Penalty / Warning indicator
  }
  score += calorieScore;

  let rating: 'Excellent' | 'Great' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor' = 'Good';
  let status: 'Normal ✓' | 'Can Improve ↑' | 'Needs Attention ⚠' = 'Can Improve ↑';

  if (diet.totalCalories === 0 || diet.totalCalories < 500) {
    rating = 'Needs Improvement';
    status = 'Needs Attention ⚠';
  } else if (score >= 85) {
    rating = 'Excellent';
    status = 'Normal ✓';
  } else if (score >= 70) {
    rating = 'Great';
    status = 'Normal ✓';
  } else if (score >= 45) {
    rating = 'Good';
    status = 'Can Improve ↑';
  } else {
    rating = 'Average';
    status = 'Can Improve ↑';
  }

  const verdict = diet.totalCalories === 0 || diet.totalCalories < 500
    ? `Your log indicates either a rapid fasting period or incomplete food diaries (${diet.totalCalories} kcal). Consuming adequate recovery fuel is non-negotiable for high performance.`
    : `Your workout logged of ${workout.duration} minutes shows strong commitment. Your diet totals ${diet.totalCalories} kcal with ${diet.waterIntake}L water. Stay consistent daily.`;

  return {
    rating,
    verdict,
    dietTips: {
      add: [
        { icon: 'Beef', title: 'Lean Proteins', explanation: 'Add chicken breast, dal, paneer, or organic tofu to heal muscular tear and support muscle synthesis.' },
        { icon: 'Droplet', title: 'More H2O', explanation: 'Aim to cross the 3L threshold to power energetic metabolic cycles.' }
      ],
      avoid: [
        { icon: 'Ban', title: 'Refined Carbs', explanation: 'Cut out simple sugars around evening hours to lower cortisol production.' }
      ]
    },
    workoutFeedback: {
      good: `Outstanding exercise range. Logging ${workout.exercises.length || 1} exercises shows solid athletic discipline.`,
      improve: `Ensure you maintain 1-2 minutes max between heavy lifting exercises to sustain cardiorespiratory activity. Supports daily exercise routine rotation.`,
      nextWorkout: `Try structured HIIT or push pull legs split to target physical progression across muscle groups.`
    },
    roadmap: [
      { day: 1, title: 'Base Optimization', description: 'Align carb window and sleep to 8 full hours.' },
      { day: 2, title: 'Fasted Low Carb Cardio', description: 'Perform 25 minutes of light zone-2 run.' },
      { day: 3, title: 'Power Compound Lifting', description: 'Work on your leg base with squats & extensions.' },
      { day: 4, title: 'Hydration Recovery Run', description: 'Hit exactly 3L clean water and dynamic stretching.' },
      { day: 5, title: 'Upper Hypertrophy Grind', description: 'Log progressive set scaling on chest and back pulls.' },
      { day: 6, title: 'Avoid All Sugar Challenges', description: 'Sustain full dietary fiber focus without shortcuts.' },
      { day: 7, title: 'Review Fitqon Roadmaps', description: 'Complete a fit checking session to secure consistency stats.' }
    ],
    status
  };
}
