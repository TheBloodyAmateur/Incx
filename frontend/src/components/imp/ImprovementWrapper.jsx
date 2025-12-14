import React from 'react';
import ImprovementSidebar from './ImprovementSidebar';
import { useUX } from '../../context/UXContext';

const ImprovementWrapper = ({ children }) => {
  // 1. Wir holen uns die Zustände und Toggle-Funktionen aus dem Context
  // 'improverActive' ist der Alias für 'areImprovementsEnabled' (siehe UXContext)
  const { improverActive, toggleImprover, sidebarOpen, toggleSidebar } = useUX();

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-white relative">
      
      {/* --- 2. MASTER CONTROL (Oben Rechts Overlay) --- */}
      {/* Dieser Block ist der schwebende Schalter für den "UI IMPROVER" */}
      <div className="absolute top-4 right-6 z-50 flex items-center gap-3 bg-neutral-900/80 backdrop-blur p-2 rounded-full border border-white/10 shadow-lg transition-opacity hover:opacity-100 opacity-80">
    
        <span className="text-xs font-mono text-neutral-400 pl-2">UI IMPROVER</span>
        
        {/* Hauptschalter (An/Aus) */}
        <button 
          onClick={toggleImprover}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${
            improverActive ? 'bg-emerald-500' : 'bg-neutral-700'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            improverActive ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>

        {/* Sidebar Einklappen/Ausklappen (Nur sichtbar wenn Improver an ist) */}
        {improverActive && (
          <button 
            onClick={toggleSidebar}
            className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title={sidebarOpen ? "Sidebar einklappen" : "Sidebar ausklappen"}
          >
             {/* Icon rotiert beim Umschalten */}
             <svg className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
          </button>
        )}
      </div>

      {/* --- MAIN CONTENT (Deine Page) --- */}
      <main className="flex-1 overflow-y-auto relative z-0 dark-scrollbar transition-all duration-300">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* --- 3. SIDEBAR (Animated) --- */}
      {/* Die Sidebar gleitet herein, wenn improverActive UND sidebarOpen wahr sind */}
      <aside 
        className={`flex-shrink-0 z-10 bg-neutral-900 border-l border-white/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          improverActive && sidebarOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {/* Innerer Container fixiert die Breite, damit der Inhalt beim Zuklappen nicht gequetscht wird */}
        <div className="w-[400px] h-full"> 
          <ImprovementSidebar />
        </div>
      </aside>
    </div>
  );
};

export default ImprovementWrapper;