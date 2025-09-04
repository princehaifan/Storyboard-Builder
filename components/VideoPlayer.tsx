
import React from 'react';

interface VideoPlayerProps {
    videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
    return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
                src={videoUrl}
                controls
                className="w-full h-full"
                preload="metadata"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};
