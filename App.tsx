
import React, { useState, useCallback } from 'react';
import { Character, Scene } from './types';
import { 
    VISUAL_STYLES, ENVIRONMENTS, VOICE_STYLES, MUSIC_STYLES, 
    CAMERA_STYLES, DETAIL_LEVELS, LANGUAGES, VIDEO_GENERATION_MESSAGES,
    TRANSITION_STYLES
} from './constants';
import * as geminiService from './services/geminiService';
import { CharacterInput } from './components/CharacterInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { SceneCard } from './components/SceneCard';
import { VideoPlayer } from './components/VideoPlayer';
import { FilmIcon, PlusIcon } from './components/icons';

const App: React.FC = () => {
    const [storyConcept, setStoryConcept] = useState('');
    const [numberOfScenes, setNumberOfScenes] = useState(4);
    const [language, setLanguage] = useState('English');
    const [visualStyle, setVisualStyle] = useState('Anime-inspired');
    const [setting, setSetting] = useState('school');
    const [characters, setCharacters] = useState<Character[]>([
        { id: 1, name: 'Character 1', age: '20s', gender: 'Female', appearance: 'Long black hair, sharp eyes', outfit: 'Modern detective trench coat', traits: 'determined, observant', motivation: 'deliver a mysterious package' },
        { id: 2, name: 'Aminu', age: '10s', gender: 'Male', appearance: 'Short spiky hair, curious expression', outfit: 'School uniform', traits: 'brave, resourceful', motivation: 'uncover a local mystery' }
    ]);
    const [voiceStyle, setVoiceStyle] = useState('educational');
    const [musicStyle, setMusicStyle] = useState('light-adventure');
    const [cameraStyle, setCameraStyle] = useState('cinematic');
    const [detailLevel, setDetailLevel] = useState('High Detail');
    const [sceneTransitionStyle, setSceneTransitionStyle] = useState('Fade');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [generatedScenes, setGeneratedScenes] = useState<Scene[]>([]);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [regeneratingSceneId, setRegeneratingSceneId] = useState<number | null>(null);

    const handleAddCharacter = () => {
        const newId = characters.length > 0 ? Math.max(...characters.map(c => c.id)) + 1 : 1;
        setCharacters([...characters, {
            id: newId, name: `Character ${newId}`, age: '', gender: '', appearance: '', outfit: '', traits: '', motivation: ''
        }]);
    };

    const handleCharacterChange = (updatedCharacter: Character) => {
        setCharacters(characters.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    };

    const handleRemoveCharacter = (id: number) => {
        setCharacters(characters.filter(c => c.id !== id));
    };
    
    const onVideoProgressUpdate = useCallback((message: string) => {
        setLoadingMessage(message);
    }, []);

    const handleSceneDescriptionChange = (sceneId: number, newDescription: string) => {
        setGeneratedScenes(currentScenes =>
            currentScenes.map(scene =>
                scene.id === sceneId ? { ...scene, description: newDescription } : scene
            )
        );
    };

    const handleRegenerateSceneImage = async (sceneId: number, sceneDescription: string) => {
        setRegeneratingSceneId(sceneId);
        setError(null);
        try {
            const newImageUrl = await geminiService.generateImageForScene(
                `${sceneDescription}, in a ${visualStyle} style, set in a ${setting}.`, 
                visualStyle
            );
            setGeneratedScenes(currentScenes =>
                currentScenes.map(scene =>
                    scene.id === sceneId ? { ...scene, imageUrl: newImageUrl } : scene
                )
            );
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? `Failed to regenerate image for scene ${sceneId}: ${err.message}` : 'An unknown error occurred during regeneration.');
        } finally {
            setRegeneratingSceneId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedScenes([]);
        setGeneratedVideoUrl(null);
        
        const formData = { storyConcept, numberOfScenes, language, visualStyle, setting, characters, voiceStyle, musicStyle, cameraStyle, detailLevel, sceneTransitionStyle };

        try {
            setLoadingMessage('Step 1/3: Generating scene descriptions...');
            const sceneDescriptions = await geminiService.generateSceneDescriptions(formData);

            setLoadingMessage('Step 2/3: Creating storyboard images...');
            const imagePromises = sceneDescriptions.map((desc, index) => 
                geminiService.generateImageForScene(`${desc}, in a ${visualStyle} style, set in a ${setting}.`, visualStyle)
            );
            const images = await Promise.all(imagePromises);
            
            const scenes: Scene[] = sceneDescriptions.map((desc, i) => ({
                id: i + 1,
                description: desc,
                imageUrl: images[i],
            }));
            setGeneratedScenes(scenes);

            setLoadingMessage('Step 3/3: Assembling the final video...');
            const videoUrl = await geminiService.generateVideoFromStory(formData, onVideoProgressUpdate);
            setGeneratedVideoUrl(videoUrl);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center gap-3">
                        <FilmIcon /> Storyboard Builder
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">Transform your ideas into visual stories with AI.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-gray-800 rounded-lg shadow-lg">
                        {/* Story Concept */}
                        <fieldset className="border border-gray-600 p-4 rounded-md">
                            <legend className="px-2 text-lg font-semibold text-indigo-400">🧠 Story Concept</legend>
                            <textarea
                                value={storyConcept}
                                onChange={(e) => setStoryConcept(e.target.value)}
                                placeholder="Describe your story concept, characters, and main plot points..."
                                className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                required
                            />
                        </fieldset>

                        {/* Core Settings */}
                        <fieldset className="border border-gray-600 p-4 rounded-md">
                            <legend className="px-2 text-lg font-semibold text-indigo-400">🎞️ Core Settings</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectInput label="Number of Scenes" value={numberOfScenes} onChange={e => setNumberOfScenes(Number(e.target.value))} options={[...Array(10).keys()].map(i => i + 1)} />
                                <SelectInput label="Language" value={language} onChange={e => setLanguage(e.target.value)} options={LANGUAGES} />
                                <SelectInput label="Visual Style" value={visualStyle} onChange={e => setVisualStyle(e.target.value)} options={VISUAL_STYLES} />
                                <SelectInput label="Setting & Environment" value={setting} onChange={e => setSetting(e.target.value)} options={ENVIRONMENTS} />
                            </div>
                        </fieldset>
                        
                        {/* Characters */}
                        <fieldset className="border border-gray-600 p-4 rounded-md">
                            <legend className="px-2 text-lg font-semibold text-indigo-400">👤 Characters</legend>
                            <div className="space-y-6">
                                {characters.map((char) => (
                                    <CharacterInput
                                        key={char.id}
                                        character={char}
                                        onChange={handleCharacterChange}
                                        onRemove={handleRemoveCharacter}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddCharacter}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-indigo-300 font-semibold rounded-md transition duration-200"
                            >
                                <PlusIcon /> Add Character
                            </button>
                        </fieldset>

                        {/* Audio & Technical */}
                        <fieldset className="border border-gray-600 p-4 rounded-md">
                            <legend className="px-2 text-lg font-semibold text-indigo-400">🎥 Audio & Technical</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <SelectInput label="Voice Style" value={voiceStyle} onChange={e => setVoiceStyle(e.target.value)} options={VOICE_STYLES} />
                                <SelectInput label="Music Style" value={musicStyle} onChange={e => setMusicStyle(e.target.value)} options={MUSIC_STYLES} />
                                <SelectInput label="Camera Style" value={cameraStyle} onChange={e => setCameraStyle(e.target.value)} options={CAMERA_STYLES} />
                                <SelectInput label="Detail Level" value={detailLevel} onChange={e => setDetailLevel(e.target.value)} options={DETAIL_LEVELS} />
                                <SelectInput label="Scene Transition Style" value={sceneTransitionStyle} onChange={e => setSceneTransitionStyle(e.target.value)} options={TRANSITION_STYLES} />
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 text-lg font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-3"
                        >
                           {isLoading ? 'Generating...' : '🎬 Generate Storyboard'}
                        </button>
                    </form>

                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[50vh]">
                        {isLoading ? (
                            <LoadingIndicator message={loadingMessage} />
                        ) : error ? (
                            <div className="text-center text-red-400">
                                <h3 className="text-xl font-bold">An Error Occurred</h3>
                                <p className="mt-2">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md">Try Again</button>
                            </div>
                        ) : (generatedScenes.length > 0 || generatedVideoUrl) ? (
                            <div className="w-full space-y-8">
                                {generatedVideoUrl && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Final Video</h2>
                                        <VideoPlayer videoUrl={generatedVideoUrl} />
                                    </div>
                                )}
                                {generatedScenes.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Storyboard Scenes</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {generatedScenes.map((scene) => (
                                                <SceneCard
                                                    key={scene.id}
                                                    scene={scene}
                                                    onDescriptionChange={handleSceneDescriptionChange}
                                                    onRegenerateImage={handleRegenerateSceneImage}
                                                    isRegenerating={regeneratingSceneId === scene.id}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div className="text-center text-gray-500">
                                <FilmIcon className="mx-auto h-24 w-24" />
                                <h3 className="mt-4 text-xl font-semibold">Your story awaits</h3>
                                <p className="mt-1">Fill out the form to generate your storyboard and video.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

interface SelectInputProps {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: (string | number)[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export default App;
