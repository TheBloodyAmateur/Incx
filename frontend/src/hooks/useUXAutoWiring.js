import { useEffect } from 'react';
import { useUX } from '../context/UXContext';

/**
 * Dieser Hook automatisiert das Highlighting.
 * Er sucht im DOM nach Elementen, deren 'name' oder 'id' Attribut
 * mit einem Eintrag in 'currentImprovements' übereinstimmt.
 */
export const useUXAutoWiring = (containerRef) => {
  const { 
    currentImprovements, 
    hoverModeActive, 
    highlightedId, 
    setHighlight 
  } = useUX();

  // 1. EVENT DELEGATION (Interaktion)
  // Statt jedem Input einzeln einen Listener zu geben, hören wir auf den Container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e) => {
      if (!hoverModeActive) return;

      // Wir suchen das nächstgelegene Element mit einem Namen oder einer ID
      const target = e.target.closest('[name], [id]');
      if (!target) return;

      const identifier = target.getAttribute('name') || target.getAttribute('id');
      
      // Prüfen, ob für diesen Identifier ein Improvement existiert
      const hasImprovement = currentImprovements.some(item => item.uiName === identifier);

      if (hasImprovement) {
        setHighlight(identifier);
        e.stopPropagation(); // Verhindert Bubbling
      }
    };

    const handleMouseOut = () => {
      if (hoverModeActive) {
        setHighlight(null);
      }
    };

    // Events registrieren
    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseout', handleMouseOut);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseout', handleMouseOut);
    };
  }, [containerRef, hoverModeActive, currentImprovements, setHighlight]);


  // 2. VISUELLES FEEDBACK (CSS Klassen injizieren)
  // Wir manipulieren direkt das DOM, um die Rahmen anzuzeigen.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !currentImprovements) return;

    // Helper: Klassen sicher hinzufügen/entfernen
    const updateClasses = (element, add, classes) => {
      if (!element) return;
      classes.split(' ').forEach(cls => {
        if (add) element.classList.add(cls);
        else element.classList.remove(cls);
      });
    };

    // Definition der Tailwind-Klassen für unsere Effekte
    const CLASS_SCAN_TARGET = "ring-2 ring-emerald-500/50 cursor-help transition-all duration-200";
    const CLASS_SELECTED = "ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#0f0f0f] rounded z-10 relative shadow-[0_0_20px_rgba(16,185,129,0.5)]";

    // A. Bereinigung: Entferne ALLES von vorher (wichtig bei Re-Renders)
    const allElements = container.querySelectorAll('[name], [id]');
    allElements.forEach(el => {
      updateClasses(el, false, CLASS_SCAN_TARGET);
      updateClasses(el, false, CLASS_SELECTED);
    });

    // B. Neue Klassen anwenden
    currentImprovements.forEach(item => {
      // Finde das Element im DOM
      const element = container.querySelector(`[name="${item.uiName}"], [id="${item.uiName}"]`);
      if (!element) return;

      // Scan-Modus Rahmen (wenn aktiv)
      if (hoverModeActive) {
        updateClasses(element, true, CLASS_SCAN_TARGET);
      }

      // Auswahl Rahmen (Dicker grüner Rahmen)
      if (highlightedId === item.uiName) {
        // Wir entfernen den Scan-Rahmen, damit sich die Klassen nicht beißen
        updateClasses(element, false, CLASS_SCAN_TARGET);
        updateClasses(element, true, CLASS_SELECTED);
      }
    });

  }, [containerRef, currentImprovements, hoverModeActive, highlightedId]);
};