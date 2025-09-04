
import React from 'react';
import { Character } from '../types';
import { TrashIcon } from './icons';

interface CharacterInputProps {
    character: Character;
    onChange: (character: Character) => void;
    onRemove: (id: number) => void;
}

export const CharacterInput: React.FC<CharacterInputProps> = ({ character, onChange, onRemove }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange({ ...character, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 relative">
            <button
                type="button"
                onClick={() => onRemove(character.id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition"
                aria-label="Remove Character"
            >
                <TrashIcon />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <TextInput label="Name" name="name" value={character.name} onChange={handleChange} />
                <TextInput label="Age" name="age" value={character.age} onChange={handleChange} />
                <TextInput label="Gender" name="gender" value={character.gender} onChange={handleChange} />
                <TextInput label="Traits" name="traits" value={character.traits} onChange={handleChange} placeholder="e.g., determined, observant" />
                <div className="sm:col-span-2">
                    <TextInput label="Appearance (face/hair/body)" name="appearance" value={character.appearance} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                    <TextInput label="Outfit / Wardrobe" name="outfit" value={character.outfit} onChange={handleChange} />
                </div>
                <div className="sm:col-span-2">
                    <TextInput label="Goal/Motivation" name="motivation" value={character.motivation} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
};

interface TextInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={`${name}-${label}`} className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input
            type="text"
            id={`${name}-${label}`}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full text-sm p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
);
