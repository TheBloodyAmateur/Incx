import React, { createContext, useState, useContext } from 'react';
import { ImprovementService } from '../services/ImprovementService';

const UXContext = createContext();

export const useUX = () => useContext(UXContext);

export const UXProvider = ({ children }) => {
    const [areImprovementsEnabled, setAreImprovementsEnabled] = useState(false);
    const [displayMode, setDisplayMode] = useState('HOVER'); 
    const [currentImprovements, setCurrentImprovements] = useState([]);
    const [loading, setLoading] = useState(false);

    const [sidebarOpen, setSidebarOpen] = useState(false);       
    const [hoverModeActive, setHoverModeActive] = useState(false); 
    const [highlightedId, setHighlightedId] = useState(null);      


    const loadImprovementsForPage = async (pageName) => {
        setLoading(true);
        try {
            const data = await ImprovementService.getByPage(pageName);
            setCurrentImprovements(data);
        } catch (error) {
            console.error("Fehler beim Laden der Improvements:", error);
            setCurrentImprovements([]); 
        }
        setLoading(false);
    };


    const toggleImprovements = () => {
        setAreImprovementsEnabled(prev => {
            const newState = !prev;
            

            if (!newState) {
                setSidebarOpen(false);     
                setHoverModeActive(false); 
                setHighlightedId(null);    
            } else {
                setSidebarOpen(true);     
            }
            
            return newState;
        });
    };


    const setMode = (mode) => {
        setDisplayMode(mode);
    };

    const getImprovementForUI = (uiName) => {
        if (!currentImprovements) return null;
        return currentImprovements.find(item => item.uiName === uiName);
    };


    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const toggleHoverMode = () => setHoverModeActive(prev => !prev);
    const setHighlight = (id) => setHighlightedId(id);


    const value = {
        areImprovementsEnabled,
        displayMode,
        currentImprovements,
        loading,
        loadImprovementsForPage,
        toggleImprovements,
        setMode,
        getImprovementForUI,
        improverActive: areImprovementsEnabled, 
        toggleImprover: toggleImprovements,
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