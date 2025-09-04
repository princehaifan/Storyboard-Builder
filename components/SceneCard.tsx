
import React, { useState, useEffect } from 'react';
import { Scene } from '../types';
import { EditIcon, SaveIcon, CancelIcon, RefreshIcon, LoadingSpinnerIcon } from './icons';

interface SceneCardProps {
    scene: Scene;
    onDescriptionChange: (id: number, newDescription: string) => void;
    onRegenerateImage: (id: number, description: string) => Promise<void>;
    isRegenerating: boolean;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onDescriptionChange, onRegenerateImage, isRegenerating }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(scene.description);
    const [isRegenerateClicked, setIsRegenerateClicked] = useState(false);

    useEffect(() => {
        setEditedDescription(scene.description);
    }, [scene.description]);

    const handleSave = () => {
        onDescriptionChange(scene.id, editedDescription);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedDescription(scene.description);
        setIsEditing(false);
    };

    const handleRegenerate = async () => {
        setIsRegenerateClicked(true);
        await onRegenerateImage(scene.id, editedDescription);
        setIsRegenerateClicked(false);
    };

    return (
        <div className={`bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 relative ${!isEditing && 'hover:scale-[1.02]'}`}>
            {isRegenerating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                    <LoadingSpinnerIcon />
                    <p className="text-white mt-2">Regenerating...</p>
                </div>
            )}
            
            <img src={scene.imageUrl} alt={`Scene ${scene.id}: ${scene.description}`} className="w-full h-48 object-cover" />
            
            <div className="p-4">
                {isEditing ? (
                    <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition text-sm text-gray-200"
                        aria-label="Scene description"
                    />
                ) : (
                    <p className="text-sm text-gray-300"><strong>Scene {scene.id}:</strong> {scene.description}</p>
                )}
            </div>

            <div className="p-4 pt-0 flex items-center justify-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleRegenerate} disabled={isRegenerateClicked} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait transition">
                            <RefreshIcon /> {isRegenerateClicked ? 'Working...' : 'Regenerate Image'}
                        </button>
                        <button onClick={handleCancel} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition">
                            <CancelIcon /> Cancel
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                            <SaveIcon /> Save
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-300 bg-gray-600/50 rounded-md hover:bg-gray-600 transition">
                        <EditIcon /> Edit
                    </button>
                )}
            </div>
        </div>
    );
};
