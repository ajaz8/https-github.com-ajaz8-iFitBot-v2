import type { LibraryExercise } from '../types';

export const exerciseData: LibraryExercise[] = [
  {
    id: 'squat-01',
    name: 'Bodyweight Squat',
    description: 'A fundamental lower body exercise that strengthens the legs and glutes without the need for equipment.',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outwards.',
      'Keep your chest up and core engaged.',
      'Lower your hips back and down as if sitting in a chair, keeping your back straight.',
      'Go as low as you can comfortably, aiming for thighs parallel to the floor.',
      'Push through your heels to return to the starting position.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/3838249/3838249-hd.mp4',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    variations: [
        { name: 'Goblet Squat (Weighted)', description: 'Hold a dumbbell or kettlebell at your chest to add resistance and increase the challenge.'},
        { name: 'Jump Squat (Plyometric)', description: 'Explode upwards into a jump from the bottom of the squat to build power and cardiovascular endurance.'}
    ]
  },
  {
    id: 'pushup-01',
    name: 'Push-up',
    description: 'A classic bodyweight exercise that builds upper body strength, primarily targeting the chest, shoulders, and triceps.',
    instructions: [
      'Start in a high plank position with hands slightly wider than your shoulders.',
      'Keep your body in a straight line from head to heels.',
      'Lower your body until your chest nearly touches the floor.',
      'Push back up to the starting position, keeping your core tight.',
      'For an easier variation, perform with your knees on the ground.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/4753997/4753997-hd.mp4',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    variations: [
        { name: 'Knee Push-ups (Easier)', description: 'Perform the push-up with your knees on the ground to reduce the amount of body weight you are lifting.'},
        { name: 'Incline Push-ups (Easier)', description: 'Place your hands on an elevated surface like a bench or wall to make the exercise less difficult.'},
        { name: 'Decline Push-ups (Harder)', description: 'Elevate your feet on a bench to increase the resistance and target your upper chest more.'}
    ]
  },
  {
    id: 'lunge-01',
    name: 'Forward Lunge',
    description: 'An excellent exercise for targeting the quadriceps, glutes, and hamstrings, while also improving balance.',
    instructions: [
      'Stand tall with your feet hip-width apart.',
      'Step forward with one leg, lowering your hips until both knees are bent at a 90-degree angle.',
      'Ensure your front knee is directly above your ankle and your back knee is hovering just off the ground.',
      'Push off your front foot to return to the starting position.',
      'Alternate legs with each repetition.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/6740067/6740067-hd.mp4',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    difficulty: 'Beginner'
  },
  {
    id: 'db-curl-01',
    name: 'Dumbbell Bicep Curl',
    description: 'A primary isolation exercise for building strength and size in the bicep muscles.',
    instructions: [
      'Stand or sit holding a dumbbell in each hand with an underhand grip (palms facing forward).',
      'Keep your elbows close to your torso.',
      'Curl the weights up towards your shoulders, squeezing your biceps.',
      'Slowly lower the dumbbells back to the starting position.',
      'Avoid using momentum by swinging your body.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/5248530/5248530-hd.mp4',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    difficulty: 'Beginner'
  },
  {
    id: 'kb-swing-01',
    name: 'Kettlebell Swing',
    description: 'A powerful, full-body exercise that develops explosive power, strength, and cardiovascular endurance.',
    instructions: [
      'Stand with feet shoulder-width apart, holding a kettlebell with both hands.',
      'Hinge at your hips, keeping your back straight, and swing the kettlebell between your legs.',
      'Drive your hips forward explosively to swing the kettlebell up to chest level.',
      'Let gravity bring the kettlebell back down into the next swing.',
      'The power should come from your hips, not your arms.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/8038318/8038318-hd.mp4',
    muscleGroup: 'Legs',
    equipment: 'Kettlebell',
    difficulty: 'Intermediate'
  },
  {
    id: 'plank-01',
    name: 'Plank',
    description: 'An isometric core strength exercise that involves maintaining a position similar to a push-up for the maximum possible time.',
    instructions: [
      'Place your forearms on the ground with elbows aligned below shoulders.',
      'Keep your arms parallel to your body at about shoulder-width distance.',
      'Your body should form a straight line from head to heels.',
      'Engage your core and glutes to prevent your hips from sagging.',
      'Hold the position without letting your form break.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/3254924/3254924-hd.mp4',
    muscleGroup: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Beginner'
  },
  {
    id: 'db-press-01',
    name: 'Dumbbell Shoulder Press',
    description: 'A classic exercise for building strength and muscle mass in the shoulder muscles (deltoids).',
    instructions: [
      'Sit on a bench with back support, holding a dumbbell in each hand at shoulder height, palms facing forward.',
      'Press the dumbbells overhead until your arms are fully extended but not locked.',
      'Slowly lower the dumbbells back to the starting position.',
      'Keep your core engaged throughout the movement.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/6456291/6456291-hd.mp4',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate'
  },
  {
    id: 'pullup-01',
    name: 'Pull-up',
    description: 'A challenging upper-body exercise that targets the back and biceps, requiring you to pull your own body weight up.',
    instructions: [
      'Grip a pull-up bar with your palms facing away from you, hands shoulder-width apart.',
      'Hang with your arms fully extended.',
      'Pull your body up by engaging your back muscles until your chin is over the bar.',
      'Slowly lower your body back to the starting position.',
      'Use an assisted machine or bands if you cannot perform a full pull-up.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/4762116/4762116-hd.mp4',
    muscleGroup: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    variations: [
        { name: 'Band-Assisted Pull-ups (Easier)', description: 'Loop a resistance band around the bar and place your feet or knees in it to get assistance on the way up.'},
        { name: 'Chin-ups (Different Grip)', description: 'Perform the exercise with an underhand grip (palms facing you). This variation puts more emphasis on the biceps.'}
    ]
  },
  {
    id: 'band-row-01',
    name: 'Resistance Band Row',
    description: 'A versatile back exercise that can be done anywhere, targeting the lats and rhomboids with constant tension from the band.',
    instructions: [
      'Sit on the floor with your legs extended and wrap a resistance band around your feet.',
      'Hold the ends of the band with a neutral grip (palms facing each other).',
      'Keeping your back straight, pull the band towards your torso, squeezing your shoulder blades together.',
      'Pause for a moment, then slowly release to the starting position.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/7995166/7995166-hd.mp4',
    muscleGroup: 'Back',
    equipment: 'Resistance Bands',
    difficulty: 'Beginner'
  },
  {
    id: 'deadlift-01',
    name: 'Barbell Deadlift',
    description: 'A compound lift that is one of the most effective for building overall strength and muscle mass, targeting the entire posterior chain.',
    instructions: [
      'Stand with your mid-foot under the barbell.',
      'Hinge at the hips and bend your knees to grip the bar, hands just outside your legs.',
      'Keep your back straight, chest up, and engage your lats.',
      'Drive through your heels to lift the weight, keeping the bar close to your body.',
      'Stand up tall, pulling your shoulders back. Reverse the motion to lower the bar to the ground.'
    ],
    videoUrl: 'https://videos.pexels.com/video-files/6639191/6639191-hd.mp4',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'Advanced'
  }
];