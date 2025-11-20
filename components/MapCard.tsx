import React from 'react';
import { MapGroundingChunk } from '../types';
import { MapPin, Star, ExternalLink } from 'lucide-react';

interface MapCardProps {
  chunk: MapGroundingChunk;
}

export const MapCard: React.FC<MapCardProps> = ({ chunk }) => {
  const { maps } = chunk;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-2 w-full max-w-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full shrink-0">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 truncate text-sm">{maps.title}</h4>
          <p className="text-xs text-slate-500 truncate mb-1">Location result</p>
          
          {/* Mock rating if we had it, usually snippets might contain review info */}
          {maps.placeAnswerSources?.reviewSnippets && maps.placeAnswerSources.reviewSnippets.length > 0 && (
             <div className="flex items-center gap-1 mt-1 mb-2">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <p className="text-xs text-slate-600 italic line-clamp-2">
                  "{maps.placeAnswerSources.reviewSnippets[0].snippet}"
                </p>
             </div>
          )}

          <a 
            href={maps.uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 mt-1"
          >
            View on Google Maps
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};