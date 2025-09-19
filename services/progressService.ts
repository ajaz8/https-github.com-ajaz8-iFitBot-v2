
import type { UserProgress, WeightEntry, PersonalRecordEntry } from '../types';

const STORAGE_KEY = 'ifit_user_progress';

// Helper to get all progress data from localStorage
const getAllProgressData = (): Record<string, UserProgress> => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Error reading progress data from localStorage", error);
        return {};
    }
};

// Helper to save all progress data to localStorage
const saveAllProgressData = (allData: Record<string, UserProgress>): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
        console.error("Error saving progress data to localStorage", error);
    }
};

export const getProgressForUser = (email: string): UserProgress => {
    const allData = getAllProgressData();
    const normalizedEmail = email.toLowerCase();
    // Return default structure if user not found
    return allData[normalizedEmail] || { weightLog: [], personalRecords: [] };
};

export const addWeightEntry = (email: string, entry: WeightEntry): UserProgress => {
    const allData = getAllProgressData();
    const normalizedEmail = email.toLowerCase();
    const userProgress = allData[normalizedEmail] || { weightLog: [], personalRecords: [] };

    // Add new entry and sort by date
    userProgress.weightLog.push(entry);
    userProgress.weightLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    allData[normalizedEmail] = userProgress;
    saveAllProgressData(allData);
    return userProgress;
};

export const addPersonalRecordEntry = (email: string, entry: Omit<PersonalRecordEntry, 'id'>): UserProgress => {
    const allData = getAllProgressData();
    const normalizedEmail = email.toLowerCase();
    const userProgress = allData[normalizedEmail] || { weightLog: [], personalRecords: [] };

    const newRecord: PersonalRecordEntry = {
        ...entry,
        id: new Date().toISOString(), // Simple unique ID
    };

    userProgress.personalRecords.unshift(newRecord); // Add to the beginning of the list

    allData[normalizedEmail] = userProgress;
    saveAllProgressData(allData);
    return userProgress;
};

export const deletePersonalRecordEntry = (email: string, recordId: string): UserProgress => {
    const allData = getAllProgressData();
    const normalizedEmail = email.toLowerCase();
    const userProgress = allData[normalizedEmail] || { weightLog: [], personalRecords: [] };

    userProgress.personalRecords = userProgress.personalRecords.filter(pr => pr.id !== recordId);

    allData[normalizedEmail] = userProgress;
    saveAllProgressData(allData);
    return userProgress;
};