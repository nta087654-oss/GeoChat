import React from 'react';
import { SearchGroundingChunk } from '../types';
import { Search, ExternalLink } from 'lucide-react';

interface SearchCardProps {
  chunk: SearchGroundingChunk;
}

export const SearchCard: React.FC<SearchCardProps> = ({ chunk }) => {
  const { web } = chunk;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-2 w-full max-w-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="bg-emerald-100 p-2 rounded-full shrink-0">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{web.title}</h4>
          <p className="text-xs text-slate-500 mb-1">Web Source</p>
          
          <a 
            href={web.uri} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-800 mt-1"
          >
            Read Article
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};