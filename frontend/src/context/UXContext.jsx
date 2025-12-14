import React, { createContext, useState, useContext } from 'react';
// Importiere deinen echten lokalen Service
// PASSE DEN PFAD AN, FALLS DIE DATEI WOANDERS LIEGT
import { ImprovementService } from '../services/ImprovementService';

// Context erstellen
const UXContext = createContext();

// Custom Hook für einfachen Zugriff in den Components
export const useUX = () => useContext(UXContext);

export const UXProvider = ({ children }) => {
    // --- 1. EXISTING STATE (DB & Business Logic) ---
    // Diese States hattest du bereits für die Datenlogik
    const [areImprovementsEnabled, setAreImprovementsEnabled] = useState(false);
    const [displayMode, setDisplayMode] = useState('HOVER'); // 'HOVER', 'CLICK', 'TAB_ONLY'
    const [currentImprovements, setCurrentImprovements] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- 2. NEW STATE (UI & Animation) ---
    // Diese States steuern rein die visuellen Elemente
    const [sidebarOpen, setSidebarOpen] = useState(false);       
    const [hoverModeActive, setHoverModeActive] = useState(false); 
    const [highlightedId, setHighlightedId] = useState(null);      

    // --- ACTIONS ---

    // Lädt Daten für eine Seite (unverändert)
    const loadImprovementsForPage = async (pageName) => {
        setLoading(true);
        try {
            // Ruft deinen echten Service auf
            const data = await ImprovementService.getByPage(pageName);
            setCurrentImprovements(data);
        } catch (error) {
            console.error("Fehler beim Laden der Improvements:", error);
            setCurrentImprovements([]); 
        }
        setLoading(false);
    };

    // Master Toggle: Verbindet deine Logik mit einem UI-Reset
    const toggleImprovements = () => {
        setAreImprovementsEnabled(prev => {
            const newState = !prev;
            
            // Side Effects: Wenn ausgeschaltet, UI aufräumen
            if (!newState) {
                setSidebarOpen(false);     // Sidebar einklappen
                setHoverModeActive(false); // Scan-Modus deaktivieren
                setHighlightedId(null);    // Markierungen entfernen
            } else {
                setSidebarOpen(true);      // Sidebar automatisch öffnen beim Einschalten
            }
            
            return newState;
        });
    };

    // Setter für den Display-Modus
    const setMode = (mode) => {
        setDisplayMode(mode);
    };

    // Helper: Findet Improvement anhand der UI-ID
    const getImprovementForUI = (uiName) => {
        if (!currentImprovements) return null;
        return currentImprovements.find(item => item.uiName === uiName);
    };

    // Neue reine UI Actions
    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const toggleHoverMode = () => setHoverModeActive(prev => !prev);
    const setHighlight = (id) => setHighlightedId(id);

    // --- PROVIDER VALUE ---
    const value = {
        // --- Deine bestehenden Exports ---
        areImprovementsEnabled,
        displayMode,
        currentImprovements,
        loading,
        loadImprovementsForPage,
        toggleImprovements,
        setMode,
        getImprovementForUI,

        // --- Neue Aliases & Exports für die UI-Komponenten ---
        // Der ImprovementWrapper erwartet 'improverActive', wir geben ihm deinen State
        improverActive: areImprovementsEnabled, 
        toggleImprover: toggleImprovements,
        
        // UI States für Sidebar & Wrapper
        sidebarOpen, 
        setSidebarOpen,
        toggleSidebar,
        hoverModeActive, 
        toggleHoverMode,
        highlightedId, 
        setHighlight
    };

    return (
        <UXContext.Provider value={value}>
            {children}
        </UXContext.Provider>
    );
};