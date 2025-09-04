
import { GoogleGenAI, Type } from "@google/genai";
import { StoryFormData } from "../types";
import { VIDEO_GENERATION_MESSAGES } from "../constants";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePromptFromFormData = (formData: StoryFormData): string => {
    const characterDescriptions = formData.characters.map(c => 
        `- ${c.name} (${c.age}, ${c.gender}): A ${c.traits} character who wears ${c.outfit}. Their goal is to ${c.motivation}. Appearance: ${c.appearance}.`
    ).join('\n');

    return `
        Story Concept: ${formData.storyConcept}
        
        Main Characters:
        ${characterDescriptions}

        Key Settings:
        - Visual Style: ${formData.visualStyle}
        - Setting: ${formData.setting}
        - Language: ${formData.language}
        - Audio Style: ${formData.voiceStyle} voice with ${formData.musicStyle} music.
        - Camera Work: ${formData.cameraStyle}, ${formData.detailLevel}.
    `;
};


export const generateSceneDescriptions = async (formData: StoryFormData): Promise<string[]> => {
    const prompt = `
        Based on the following story details, break it down into exactly ${formData.numberOfScenes} distinct scene descriptions for a storyboard.
        Each description should be a concise, visual instruction for an image generator. Do not number the scenes, just provide the descriptions.
        
        Story Details:
        ${generatePromptFromFormData(formData)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A detailed visual description of a single scene.",
                            },
                        },
                    },
                    required: ["scenes"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        if (result && Array.isArray(result.scenes)) {
            return result.scenes;
        }
        throw new Error("Failed to parse scene descriptions from AI response.");

    } catch (error) {
        console.error("Error generating scene descriptions:", error);
        throw new Error("Could not generate scene descriptions. Please check your story concept and try again.");
    }
};

export const generateImageForScene = async (prompt: string, visualStyle: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Could not generate an image for a scene.");
    }
};

export const generateVideoFromStory = async (formData: StoryFormData, onProgress: (message: string) => void): Promise<string> => {
    const prompt = `Create a short, ${formData.cameraStyle} video based on this story. Visuals should be ${formData.visualStyle}, set in a ${formData.setting}. Use '${formData.sceneTransitionStyle}' transitions between scenes.
    Story: ${formData.storyConcept}
    Characters: ${formData.characters.map(c => c.name).join(', ')}.
    `;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            },
        });

        let progressIndex = 0;
        onProgress(VIDEO_GENERATION_MESSAGES[progressIndex]);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            
            progressIndex = (progressIndex + 1) % VIDEO_GENERATION_MESSAGES.length;
            onProgress(VIDEO_GENERATION_MESSAGES[progressIndex]);
        }
        
        onProgress("Finalizing video...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Could not generate the final video.");
    }
};
