
export interface Character {
  id: number;
  name: string;
  age: string;
  gender: string;
  appearance: string;
  outfit: string;
  traits: string;
  motivation: string;
}

export interface Scene {
  id: number;
  description: string;
  imageUrl: string;
}

export interface StoryFormData {
    storyConcept: string;
    numberOfScenes: number;
    language: string;
    visualStyle: string;
    setting: string;
    characters: Character[];
    voiceStyle: string;
    musicStyle: string;
    cameraStyle: string;
    detailLevel: string;
    sceneTransitionStyle: string;
}
