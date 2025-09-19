// services/dialogueService.ts

const welcome = (name: string): string => `Welcome, ${name}! I'm iFitBot, your AI coach. I'm really excited to build your personalized plan. Let's get started with the first question.`;

const earlyQuizEncouragement = [
    "That's a great start. Each answer is a building block for your unique iFit fitness profile.",
    "Perfect, this is exactly the kind of information I need to start tailoring your plan.",
    "Excellent! Let's keep that momentum going. The more I learn, the more personalized your results will be.",
    "Great start! Every detail helps me understand you better, which means a better plan from iFit.",
];

const transitions = [
    "Great, let's move on.",
    "Perfect. What's next?",
    "Got it. Now for this one...",
    "Okay, next question for you.",
    "This is helpful information. It's all going into your profile.",
    "You're doing great. Keep it up!",
    "Excellent. Thanks for sharing.",
    "This is all building a complete picture of you. Your iFit plan is going to be incredibly detailed.",
    "Making progress! Here's the next question.",
    "Got it. This helps me understand your lifestyle.",
    "Thanks for sharing. This is crucial for tailoring your plan.",
    "This is great. Every detail helps me create a plan that fits you perfectly.",
];

const midQuizEncouragement = [
    "Awesome, we're about halfway through! The insights we're gathering are going to make your final iFit report incredibly valuable.",
    "Keep up the great work! You've crossed the halfway mark, and the details you're providing are key to your success with iFit.",
    "You're making fantastic progress. This is where we start turning data into your personalized iFit strategy.",
    "Halfway there! The more I learn, the more customized your plan will be. Let's keep this energy up!",
];

const finalStretch = [
    "Almost there! We're on the home stretch now. Your personalized iFit report is just around the corner!",
    "Just a couple more questions left. I'm getting ready to build your custom workout and nutrition guide.",
    "Incredible focus! We're so close to unlocking your complete fitness roadmap from iFit.",
    "The finish line is in sight! These last few details will really put the finishing touches on your personalized plan.",
    "Just a few more steps to unlock your complete iFit plan. You're doing an amazing job.",
];

const finalQuestion = [
    "Alright, this is the final question. Give it your best shot! I'm ready to crunch the numbers and generate your comprehensive iFit report right after this. This is where your transformation begins!",
    "Here we are, the last question! Answer this, and I'll have everything I need to build your personalized iFit roadmap to success. Let's do it!",
    "Last one! All your hard work is about to pay off. I'm excited to show you the power of a truly personalized iFit plan.",
];

// Function to get a random item from an array
const getRandomItem = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

export const getSpokenDialogue = (stepIndex: number, totalSteps: number, name: string, question: string, subtitle?: string): string => {
    const questionText = `${question} ${subtitle || ''}`;

    // Welcome message for the very first question.
    if (stepIndex === 0) {
        return `${welcome(name)} ... ${questionText}`;
    }

    // Final question has its own special dialogue.
    if (stepIndex === totalSteps - 1) {
        return `${getRandomItem(finalQuestion)} ... ${questionText}`;
    }
    
    // Milestone: Mid-quiz (around 50%)
    if (stepIndex === Math.floor(totalSteps / 2)) {
        return `${getRandomItem(midQuizEncouragement)} ... ${questionText}`;
    }

    // Milestone: Final stretch (around 80%)
    if (stepIndex === Math.floor(totalSteps * 0.8)) {
        return `${getRandomItem(finalStretch)} ... ${questionText}`;
    }

    // Milestone: Early encouragement (around 20% or step 3)
    if (stepIndex === 3 || stepIndex === Math.floor(totalSteps * 0.2)) {
         return `${getRandomItem(earlyQuizEncouragement)} ... ${questionText}`;
    }

    // Default transition for all other steps.
    return `${getRandomItem(transitions)} ... ${questionText}`;
};