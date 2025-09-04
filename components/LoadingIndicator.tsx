
import React from 'react';

interface LoadingIndicatorProps {
    message: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-semibold text-indigo-400">Generating Your Story...</h3>
            <p className="mt-2 text-gray-400">{message}</p>
        </div>
    );
};
