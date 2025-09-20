/**
 * AI-Ready Workout Database
 * This structured data provides the AI with a clear blueprint for generating workout plans.
 * It's organized by fitness goal, then by split frequency, offering a day-by-day guide.
 *
 * - Category: The primary fitness goal (e.g., "Weight Loss").
 * - Split: The workout structure (e.g., "3-Day Split").
 * - Day: The specific day in the microcycle.
 * - Focus: The main goal of the session (e.g., "Full Body Strength + HIIT").
 * - Exercises: A list of movements with programming details.
 *   - name: The exercise name.
 *   - sets: Number of sets.
 *   - reps: Repetition range or duration.
 *   - rpe: Rate of Perceived Exertion (a measure of intensity).
 *   - variations: Alternative exercises for different contexts.
 */
export const workoutDatabase = {
  "Weight Loss": {
    "3-Day Split": [
      {
        day: 1,
        focus: "Full Body Strength + HIIT",
        exercises: [
          { name: "Goblet Squat", sets: "3", reps: "10-12", rpe: "7", variations: { equipment: "Dumbbell Push Press" } },
          { name: "Push-ups", sets: "3", reps: "AMRAP (As Many Reps As Possible)", rpe: "8", variations: { ground: "Knee Push-ups" } },
          { name: "Inverted Rows", sets: "3", reps: "10-12", rpe: "7", variations: { equipment: "Band-Assisted Pull-ups" } },
          { name: "Kettlebell Swings", sets: "5 rounds", reps: "20 sec on, 40 sec off", rpe: "9", variations: { cardio: "Burpees" } },
        ],
      },
      {
        day: 2,
        focus: "Full Body Strength + Steady Cardio",
        exercises: [
          { name: "Romanian Deadlift (Dumbbell)", sets: "3", reps: "10-12", rpe: "7", variations: { equipment: "Good Mornings (Barbell)" } },
          { name: "Dumbbell Bench Press", sets: "3", reps: "10-12", rpe: "7", variations: { ground: "Wide Push-ups" } },
          { name: "Single Arm Dumbbell Row", sets: "3", reps: "10-12 per side", rpe: "7", variations: {} },
          { name: "Incline Treadmill Walk", sets: "1", reps: "30-45 min", rpe: "5", variations: { cardio: "Cycling or Elliptical" } },
        ],
      },
      {
        day: 3,
        focus: "Full Body Strength + MetCon",
        exercises: [
          { name: "Walking Lunges", sets: "3", reps: "10-12 per leg", rpe: "7", variations: { equipment: "Bulgarian Split Squats" } },
          { name: "Overhead Press (Dumbbell)", sets: "3", reps: "10-12", rpe: "7", variations: { equipment: "Arnold Press" } },
          { name: "Plank", sets: "3", reps: "Hold for max time", rpe: "8", variations: {} },
          { name: "MetCon Finisher: 3 rounds for time", sets: "3", reps: "10 Burpees, 15 Sit-ups, 20 Air Squats", rpe: "9", variations: {} },
        ],
      },
    ],
  },
  "Lean Body": {
    "4-Day Split": [
      {
        day: 1,
        focus: "Upper Body - Push (Chest, Shoulders, Triceps)",
        exercises: [
          { name: "Barbell Bench Press", sets: "4", reps: "8-10", rpe: "8", variations: { equipment: "Dumbbell Bench Press" } },
          { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rpe: "8", variations: {} },
          { name: "Seated Dumbbell Shoulder Press", sets: "3", reps: "10-12", rpe: "8", variations: {} },
          { name: "Tricep Pushdowns (Cable)", sets: "3", reps: "12-15", rpe: "9", variations: { equipment: "Overhead Tricep Extension" } },
          { name: "Lateral Raises", sets: "3", reps: "15-20", rpe: "9", variations: {} },
        ],
      },
      {
        day: 2,
        focus: "Lower Body - Quads & Glutes",
        exercises: [
          { name: "Barbell Back Squat", sets: "4", reps: "8-10", rpe: "8", variations: { equipment: "Leg Press" } },
          { name: "Leg Press", sets: "3", reps: "12-15", rpe: "9", variations: {} },
          { name: "Walking Lunges", sets: "3", reps: "12 per leg", rpe: "8", variations: {} },
          { name: "Leg Extensions", sets: "3", reps: "15-20", rpe: "9", variations: {} },
          { name: "Glute Bridges", sets: "3", reps: "15-20", rpe: "8", variations: { equipment: "Hip Thrusts" } },
        ],
      },
      {
        day: 3,
        focus: "Upper Body - Pull (Back, Biceps)",
        exercises: [
          { name: "Pull-ups (or Assisted)", sets: "4", reps: "AMRAP", rpe: "9", variations: { equipment: "Lat Pulldowns" } },
          { name: "Bent Over Barbell Rows", sets: "3", reps: "8-10", rpe: "8", variations: { equipment: "T-Bar Row" } },
          { name: "Face Pulls", sets: "3", reps: "15-20", rpe: "8", variations: {} },
          { name: "Bicep Curls (Dumbbell)", sets: "3", reps: "12-15", rpe: "9", variations: { equipment: "Hammer Curls" } },
        ],
      },
      {
        day: 4,
        focus: "Lower Body - Hamstrings & Core",
        exercises: [
          { name: "Deadlifts", sets: "4", reps: "5-8", rpe: "8", variations: { equipment: "Romanian Deadlifts" } },
          { name: "Hamstring Curls (Machine)", sets: "3", reps: "12-15", rpe: "9", variations: {} },
          { name: "Hanging Leg Raises", sets: "3", reps: "15-20", rpe: "9", variations: { ground: "Lying Leg Raises" } },
          { name: "Cable Crunches", sets: "3", reps: "15-20", rpe: "9", variations: {} },
        ],
      },
    ],
  },
};

/*
Advanced Add-On Features
1. Smart Trainer Assignment

Instead of purely random, add weighted shuffling based on trainer expertise:

Example: If client goal = weight loss, more likely assigned to trainer specialized in fat loss.

Still keeps random factor, but biases toward expertise.

✅ Gives better alignment while keeping fairness.

2. AI-Coach Collaboration Tools

Inside the trainer’s portal:

Editable AI Report Sections → Trainer can click on exercise, nutrition tip, or recovery suggestion and instantly regenerate alternatives via AI.

Auto-Compare Drafts → Side-by-side view of “AI Draft vs Trainer Edits”. Trainer can approve or revert changes with one click.

✅ Saves trainer time, boosts trust.

3. Progression Engine

AI automatically builds Phase 1 → Phase 2 → Phase 3 (e.g., beginner → intermediate → advanced blocks).

Trainer only tweaks progression (like “increase intensity 10%” or “swap cardio type”).

✅ Long-term plan clarity for client.

4. Trainer Notes & Client Education

Final report has a trainer’s personal note auto-generated but editable:
“Hi (name of user), I’ve personally reviewed your AI-based assessment. Here’s your tailored plan. I recommend focusing extra on recovery this week. Let’s crush it together 💪 – Athul”

Client gets trust + human touch, not just raw AI.
*/
