import React from 'react';
import { useUX } from '../../context/UXContext';

const ImprovementSidebar = () => {
  const { 
    highlightedId, 
    setHighlight, 
    hoverModeActive, 
    toggleHoverMode,
    currentImprovements, 
    loading
  } = useUX();

  return (
    <div className="h-full flex flex-col w-full bg-neutral-900 text-white font-sans">
      
      {/* Header */}
      <div className="px-6 pb-6 pt-24 border-b border-white/10 bg-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            <h2 className="font-mono text-sm text-emerald-400 tracking-wider font-bold">UI IMPROVER</h2>
          </div>
          
          {/* Scan-Modus Toggle */}
          <div className="flex items-center gap-2" title="Scan-Modus: Zeige Vorschläge beim Hovern über die Seite">
            <span className={`text-[10px] font-mono transition-colors ${hoverModeActive ? 'text-white' : 'text-neutral-600'}`}>SCAN</span>
            <button 
              onClick={toggleHoverMode}
              className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${
                hoverModeActive ? 'bg-pink-500' : 'bg-neutral-700'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                hoverModeActive ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
        <p className="text-neutral-500 text-xs"></p>
      </div>

      {/* Liste der Improvements */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 dark-scrollbar">
        
        {loading && <div className="text-center text-neutral-500 text-xs py-4">Lade Daten...</div>}

        {/* Fallback wenn leer */}
        {!loading && (!currentImprovements || currentImprovements.length === 0) && (
           <div className="text-center text-neutral-600 text-xs py-10 opacity-50">
             Keine Verbesserungen gefunden.
           </div>
        )}

     
        {currentImprovements && currentImprovements.map((item) => {
          const isActive = highlightedId === item.uiName; 

          return (
            <div 
              key={item.id} 
              onMouseEnter={() => setHighlight(item.uiName)}
              onMouseLeave={() => setHighlight(null)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-default ${
                isActive 
                  ? 'bg-white/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/20 text-amber-400 uppercase">
                  {item.uiType || 'UX'}
                </span>
              </div>

              <h3 className={`font-medium mb-1 transition-colors ${isActive ? 'text-emerald-300' : 'text-white'}`}>
                {item.uiName}
              </h3>
              
              <div className="space-y-3">
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {item.description}
                </p>
                
                {/* Lösungsvorschlag */}
                {item.improvementProposal && (
                  <div className="bg-neutral-950/50 p-2 rounded text-xs text-neutral-300 border-l-2 border-neutral-700">
                    {item.improvementProposal}
                  </div>
                )}
              </div>
              {item.improvementComponent && (
              <button className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white text-neutral-400 text-sm font-medium transition-all duration-200 border border-white/5 hover:border-emerald-500 flex items-center justify-center gap-2 group-hover:text-white">
                <span>Optimierung anwenden</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>)}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-neutral-900">
        <div className="flex justify-between items-center text-[10px] text-neutral-600 font-mono uppercase">
        </div>
      </div>
    </div>
  );
};

export default ImprovementSidebar;
