'use client';

import { Play, ExternalLink } from 'lucide-react';
import { VideoLesson } from '@/lib/types';
import { useState } from 'react';

interface VideoPlayerProps {
  video: VideoLesson;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeId(video.url);

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
      {/* Video Container */}
      <div className="relative aspect-video bg-muted">
        {isPlaying && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 group cursor-pointer"
          >
            {/* Thumbnail placeholder */}
            {videoId && (
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to lower quality thumbnail if maxres doesn't exist
                  e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-foreground/40 group-hover:bg-foreground/30 transition-colors" />
            
            {/* Play button */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
            </div>
            
            <span className="relative z-10 text-white font-medium text-shadow">Watch Video</span>
          </button>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1">{video.title}</h4>
            <p className="text-sm text-muted-foreground">{video.source} • {video.duration}</p>
          </div>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors flex-shrink-0 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open in YouTube</span>
          </a>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{video.description}</p>
      </div>
    </div>
  );
}
