import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, X } from 'lucide-react';
import { exerciseData } from '../data/exerciseData';
import type { LibraryExercise, MuscleGroup, Equipment, Difficulty } from '../types';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

const FilterSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
    <div className="flex-1 min-w-[150px]">
        <label htmlFor={label} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select
            id={label}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500"
        >
            <option value="">All</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function ExerciseLibraryPage() {
    const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);
    const [filters, setFilters] = useState({
        muscleGroup: '',
        equipment: '',
        difficulty: ''
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>, filterType: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [filterType]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ muscleGroup: '', equipment: '', difficulty: '' });
    };

    const filteredExercises = useMemo(() => {
        return exerciseData.filter(ex => {
            const muscleMatch = filters.muscleGroup ? ex.muscleGroup === filters.muscleGroup : true;
            const equipmentMatch = filters.equipment ? ex.equipment === filters.equipment : true;
            const difficultyMatch = filters.difficulty ? ex.difficulty === filters.difficulty : true;
            return muscleMatch && equipmentMatch && difficultyMatch;
        });
    }, [filters]);

    const handleCardClick = (exercise: LibraryExercise) => {
        setSelectedExercise(exercise);
    };

    const closeModal = () => {
        setSelectedExercise(null);
    };

    const muscleGroups = useMemo(() => [...new Set(exerciseData.map(ex => ex.muscleGroup))], []);
    const equipmentTypes = useMemo(() => [...new Set(exerciseData.map(ex => ex.equipment))], []);
    const difficultyLevels = useMemo(() => [...new Set(exerciseData.map(ex => ex.difficulty))], []);


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <Link to="/" className="text-gray-300 hover:text-lime-500 flex items-center mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="text-center mb-8 md:mb-12">
                    <BookOpen className="w-16 h-16 mx-auto text-lime-500 mb-4" />
                    <h1 className="text-5xl font-bold mb-2">Exercise Library</h1>
                    <p className="text-lg text-gray-400">Find the perfect exercise to add to your routine.</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8 flex flex-wrap gap-4 items-end">
                    <FilterSelect label="Muscle Group" value={filters.muscleGroup} onChange={(e) => handleFilterChange(e, 'muscleGroup')} options={muscleGroups} />
                    <FilterSelect label="Equipment" value={filters.equipment} onChange={(e) => handleFilterChange(e, 'equipment')} options={equipmentTypes} />
                    <FilterSelect label="Difficulty" value={filters.difficulty} onChange={(e) => handleFilterChange(e, 'difficulty')} options={difficultyLevels} />
                    <button onClick={resetFilters} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center h-10 transition-colors">
                        <X className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reset Filters</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredExercises.map(ex => (
                        <ExerciseCard key={ex.id} exercise={ex} onClick={handleCardClick} />
                    ))}
                </div>

                {filteredExercises.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-400">No exercises match your criteria.</p>
                    </div>
                )}
            </div>
            
            <ExerciseDetailModal
                exercise={selectedExercise}
                isOpen={!!selectedExercise}
                onClose={closeModal}
            />
        </div>
    );
}