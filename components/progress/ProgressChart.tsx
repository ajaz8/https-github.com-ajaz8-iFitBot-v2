

import React from 'react';
import type { WeightEntry } from '../../types';

interface ProgressChartProps {
    data: WeightEntry[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
    if (data.length < 2) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-800/50 rounded-lg">
                <p>Not enough data to display a chart. Please add at least two weight entries.</p>
            </div>
        );
    }
    
    const svgWidth = 500;
    const svgHeight = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const weights = data.map(d => d.weight);
    const dates = data.map(d => new Date(d.date));

    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const minDate = Math.min(...dates.map(d => d.getTime()));
    const maxDate = Math.max(...dates.map(d => d.getTime()));

    const getX = (date: Date) => {
        if (maxDate === minDate) return margin.left;
        return margin.left + ((date.getTime() - minDate) / (maxDate - minDate)) * width;
    };

    const getY = (weight: number) => {
        if (maxWeight === minWeight) return margin.top + height / 2;
        return margin.top + height - ((weight - minWeight) / (maxWeight - minWeight)) * height;
    };

    const pathData = data.map(d => `${getX(new Date(d.date))},${getY(d.weight)}`).join(' L ');

    return (
        <div className="bg-gray-800/50 rounded-lg p-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                {/* Y-axis */}
                <text x={margin.left - 10} y={margin.top} dy="0.32em" fill="#9ca3af" textAnchor="end" fontSize="10">{maxWeight.toFixed(1)} kg</text>
                <text x={margin.left - 10} y={margin.top + height} fill="#9ca3af" textAnchor="end" fontSize="10">{minWeight.toFixed(1)} kg</text>
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + height} stroke="#4b5563" />

                {/* X-axis */}
                <text x={margin.left} y={margin.top + height + 20} fill="#9ca3af" textAnchor="start" fontSize="10">{dates[0].toLocaleDateString()}</text>
                <text x={margin.left + width} y={margin.top + height + 20} fill="#9ca3af" textAnchor="end" fontSize="10">{dates[dates.length - 1].toLocaleDateString()}</text>
                <line x1={margin.left} y1={margin.top + height} x2={margin.left + width} y2={margin.top + height} stroke="#4b5563" />

                {/* Line */}
                <path d={`M ${pathData}`} fill="none" stroke="#a3e635" strokeWidth="2" />

                {/* Points */}
                {data.map((d, i) => (
                    <circle key={i} cx={getX(new Date(d.date))} cy={getY(d.weight)} r="3" fill="#a3e635">
                        <title>{`${d.weight} kg on ${new Date(d.date).toLocaleDateString()}`}</title>
                    </circle>
                ))}
            </svg>
        </div>
    );
}