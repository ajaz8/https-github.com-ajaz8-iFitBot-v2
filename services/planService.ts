import type { PendingWorkoutPlan } from '../types';

const STORAGE_KEY = 'pending_plans';

/**
 * Retrieves all pending workout plans from localStorage.
 * Includes robust error handling for parsing.
 * @returns {PendingWorkoutPlan[]} An array of plans.
 */
export const getPendingPlans = (): PendingWorkoutPlan[] => {
    try {
        const plansJSON = localStorage.getItem(STORAGE_KEY);
        if (plansJSON) {
            const parsedPlans = JSON.parse(plansJSON);
            if (Array.isArray(parsedPlans)) {
                return parsedPlans;
            }
        }
        return [];
    } catch (error) {
        console.error("Failed to parse pending plans from localStorage:", error);
        // If data is corrupted, clear it to prevent further errors
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
};

/**
 * Saves the entire list of plans back to localStorage.
 * @param {PendingWorkoutPlan[]} plans - The array of plans to save.
 */
const savePlans = (plans: PendingWorkoutPlan[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
        console.error("Failed to save pending plans to localStorage:", error);
    }
};

/**
 * Adds a new pending workout plan to the list in localStorage.
 * @param {PendingWorkoutPlan} newPlan - The new plan to add.
 */
export const addPendingPlan = (newPlan: PendingWorkoutPlan): void => {
    const existingPlans = getPendingPlans();
    const updatedPlans = [...existingPlans, newPlan];
    savePlans(updatedPlans);
};

/**
 * Updates an existing plan in localStorage, typically to change its status.
 * @param {string} planId - The ID of the plan to update.
 * @param {Partial<PendingWorkoutPlan>} updates - An object with the fields to update.
 */
export const updatePlan = (planId: string, updates: Partial<PendingWorkoutPlan>): void => {
    const existingPlans = getPendingPlans();
    const updatedPlans = existingPlans.map(plan => {
        if (plan.id === planId) {
            return { ...plan, ...updates };
        }
        return plan;
    });
    savePlans(updatedPlans);
};
