const API_URL = "http://localhost:8080/api/improvements";

export const ImprovementService = {
    /**
     * Lädt alle Improvements für eine bestimmte Seite.
     * @param {string} pageName - Der Name der Seite (z.B. "BookingPage")
     */
    getByPage: async (pageName) => {
        try {
            const response = await fetch(`${API_URL}?page=${pageName}`);
            if (!response.ok) {
                throw new Error(`Fehler beim Laden der Improvements: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("ImprovementService Error:", error);
            return []; // Leeres Array bei Fehler, damit die App nicht crasht
        }
    },

    /**
     * Lädt alle Improvements (für eine globale Übersicht, falls nötig).
     */
    getAll: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error("Fehler beim Laden aller Improvements");
            }
            return await response.json();
        } catch (error) {
            console.error("ImprovementService Error:", error);
            return [];
        }
    }
};