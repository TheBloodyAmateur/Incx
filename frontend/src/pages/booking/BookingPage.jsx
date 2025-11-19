import React, { useState, useEffect } from 'react';

// Einfache Liste der Monate für die Vorschläge
const MONTHS = [
  "JANUAR", "FEBRUAR", "MÄRZ", "APRIL", "MAI", "JUNI",
  "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DEZEMBER"
];

export default function BookingPage() {
  const [dateFormat, setDateFormat] = useState("");

  // Initialer State für das Formular
  const initialFormState = {
    salutation: 1, // 0: Herr, 1: Frau, 2: Keine Angabe (Start in der Mitte für Slider)
    firstName: "",
    lastName: "",
    email: "",
    day: 1,
    month: "",
    year: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // State für UI-Logik
  const [monthSuggestions, setMonthSuggestions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [errors, setErrors] = useState({});


  useEffect(() => {
    const formats = ["MM/DD/YYYY", "DD.MM.YYYY", "YYYY-MM-DD", "DD/MM/YYYY"];
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    setDateFormat(randomFormat);
  }, []);

  // Hilfsfunktion: Slider-Wert in Text umwandeln 
  const getSalutationLabel = (val) => {
    if (val == 0) return "Herr";
    if (val == 1) return "Frau";
    return "Keine Angabe";
  };

  // Handler für Änderungen
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));


    if (name === "month") {
      if (value.trim() === "") {
        setMonthSuggestions([]);
      } else {
        const filtered = MONTHS.filter(m => m.includes(value.toUpperCase()));
        setMonthSuggestions(filtered);
      }
    }
  };


  // Eingabe vor/nach @ erst möglich, wenn @ existiert.
  const handleEmailKeyDown = (e) => {
    // Erlaube Steuertasten (Backspace, Tab, Arrows, etc.)
    if (e.key.length > 1) return;

    const hasAt = formData.email.includes('@');
    
    // Wenn kein @ da ist, und die gedrückte Taste nicht @ ist -> Blockieren
    if (!hasAt && e.key !== '@') {
      e.preventDefault();
      alert("Hoppla! Du  mussterst das '@' eingeben, bevor du den Rest schreiben darfst.");
    }
  };

  const adjustDay = (delta) => {
    setFormData(prev => {
      let newDay = prev.day + delta;
      if (newDay < 1) newDay = 1;
      if (newDay > 31) newDay = 31;
      return { ...prev, day: newDay };
    });
  };

  //  Klick auf Monat-Vorschlag darf NICHT füllen
  const handleMonthSuggestionClick = (e) => {
    e.preventDefault();
    // Wir tun absichtlich nichts oder geben einen nervigen Alert
    // Damit muss der User es manuell tippen.
  };

  // Validierung
  const validate = () => {
    const newErrors = {};
    

    if (!MONTHS.includes(formData.month.toUpperCase())) {
      newErrors.month = "Der Monat muss exakt ausgeschrieben sein (wie im Vorschlag).";
    }

    if (!formData.firstName) newErrors.firstName = "Name fehlt.";
    if (!formData.lastName) newErrors.lastName = "Nachname fehlt.";
    
    if (!formData.email.includes('@')) {
      newErrors.email = "E-Mail muss ein @ enthalten.";
    }
    // Check auf Local/Domain Part Existenz
    const parts = formData.email.split('@');
    if (parts.length < 2 || parts[0] === "" || parts[1] === "") {
        newErrors.email = "E-Mail unvollständig (Zeichen vor und nach @ nötig).";
    }

    if (!formData.year) newErrors.year = "Jahr fehlt.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validieren
    const validationErrors = validate();
    setErrors(validationErrors);
    setIsSubmitted(true); 

    if (Object.keys(validationErrors).length === 0) {
      // Erfolg simulation
      alert(`Termin erfolgreich gebucht für den ${formData.day}. ${formData.month} ${formData.year}!`);
    } else {
      // Fehlschlag simulation
      alert("Fehler bei der Buchung. Bitte korrigieren.");
    }

    setFormData(initialFormState);
    setMonthSuggestions([]);
    // Fehler bleiben sichtbar (da isSubmitted true ist), aber Felder sind leer -> Maximale Verwirrung
  };

  return (
    <div className="booking-wrapper">
        <style>{`
            .booking-wrapper {
                width: 100vw;
                min-height: 100vh;
                background-color: #1a1a1a;
                color: #e0e0e0;
                display: flex;
                justify-content: center;
                padding-top: 50px;
                font-family: 'Arial', sans-serif;
            }
            .booking-container {
                background: rgba(255, 255, 255, 0.05);
                padding: 2rem;
                border-radius: 12px;
                width: 100%;
                max-width: 600px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            h1 {
                text-align: center;
                margin-bottom: 1rem;
                color: #fff;
            }
            .date-format-banner {
                background: #46338A;
                color: white;
                padding: 0.5rem;
                text-align: center;
                margin-bottom: 2rem;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            .incx-form {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .focusable-label {
                font-size: 0.9rem;
                color: #aaa;
                outline: none;
                width: fit-content;
            }
            .focusable-label:focus {
                color: #0F6A77;
                text-decoration: underline;
                font-weight: bold;
            }
            input[type="text"],
            input[type="number"] {
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #444;
                background: #2a2a2a;
                color: white;
                font-size: 1rem;
            }
            input:focus {
                outline: 2px solid #46338A;
            }
            .slider-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                background: #2a2a2a;
                padding: 10px;
                border-radius: 4px;
            }
            .range-slider {
                width: 100%;
                cursor: pointer;
            }
            .slider-value {
                margin-top: 5px;
                font-weight: bold;
                color: #0F6A77;
            }
            .date-group {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: space-between;
            }
            .date-part {
                display: flex;
                flex-direction: column;
                width: 30%;
            }
            .full-width {
                width: 100%;
            }
            .sub-label {
                font-size: 0.8rem;
                color: #888;
                margin-bottom: 4px;
                outline: none;
            }
            .sub-label:focus {
                color: #fff;
            }
            .day-controls {
                display: flex;
                gap: 5px;
            }
            .day-controls button {
                width: 30px;
                background: #46338A;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 4px;
            }
            .day-input {
                width: 50px !important;
                text-align: center;
                cursor: not-allowed;
            }
            .relative {
                position: relative;
            }
            .month-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #333;
                border: 1px solid #555;
                list-style: none;
                padding: 0;
                margin: 0;
                z-index: 100;
                max-height: 150px;
                overflow-y: auto;
            }
            .month-suggestions li {
                padding: 8px;
                border-bottom: 1px solid #444;
                cursor: help;
            }
            .month-suggestions li:hover {
                background: #444;
            }
            .error-border {
                border-color: #ff4444 !important;
            }
            .error-msg {
                color: #ff4444;
                font-size: 0.8rem;
            }
            .info-hint {
                color: #0F6A77;
                font-size: 0.8rem;
                font-style: italic;
            }
            .submit-btn {
                margin-top: 1rem;
                padding: 15px;
                background: linear-gradient(45deg, #46338A, #0F6A77);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: transform 0.1s;
            }
            .submit-btn:active {
                transform: scale(0.98);
            }
            .error-summary {
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid red;
                padding: 10px;
                text-align: center;
                border-radius: 4px;
            }
        `}</style>
      <div className="booking-container">
        <h1>Termin buchen</h1>
    
        <div className="date-format-banner">
          Heutiges Datumsformat: <strong>{dateFormat}</strong>
        </div>

        <form onSubmit={handleSubmit} className="incx-form">
          
     
          <div className="form-group">
           
            <label tabIndex="0" className="focusable-label">Anrede</label>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
                className="range-slider"
              />
              <div className="slider-value">
                {getSalutationLabel(formData.salutation)}
              </div>
            </div>
          </div>

   
          <div className="form-group">
            <label tabIndex="0" htmlFor="firstName" className="focusable-label">Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={isSubmitted && errors.firstName ? "error-border" : ""}
            />
            {isSubmitted && errors.firstName && <span className="error-msg">{errors.firstName}</span>}
          </div>

        
          <div className="form-group">
            <label tabIndex="0" htmlFor="lastName" className="focusable-label">Nachname</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={isSubmitted && errors.lastName ? "error-border" : ""}
            />
            {isSubmitted && errors.lastName && <span className="error-msg">{errors.lastName}</span>}
          </div>

      
          <div className="form-group">
            <label tabIndex="0" htmlFor="email" className="focusable-label">E-Mail</label>
      
            {!formData.email && <span className="info-hint">Hinweis: Eine E-Mail muss ein @ enthalten.</span>}
            
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onKeyDown={handleEmailKeyDown} // Die "erst das @" Logik
              onChange={handleChange}
              placeholder="Erst @ tippen..."
              className={isSubmitted && errors.email ? "error-border" : ""}
            />
            {isSubmitted && errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

        
          <div className="form-group date-group">
            <label tabIndex="0" className="focusable-label full-width">Wunschtermin</label>
            
          
            <div className="date-part">
              <label tabIndex="0" className="sub-label">Tag</label>
              <div className="day-controls">
                <button type="button" onClick={() => adjustDay(-1)}>-</button>
                <input 
                  type="number" 
                  value={formData.day} 
                  readOnly 
                  className="day-input"
                />
                <button type="button" onClick={() => adjustDay(1)}>+</button>
              </div>
            </div>


            <div className="date-part relative">
              <label tabIndex="0" className="sub-label">Monat</label>
              <input
                type="text"
                name="month"
                value={formData.month}
                onChange={handleChange}
                autoComplete="off"
                className={isSubmitted && errors.month ? "error-border" : ""}
              />
              {monthSuggestions.length > 0 && (
                <ul className="month-suggestions">
                  {monthSuggestions.map(m => (
                    <li 
                      key={m} 
                      onClick={handleMonthSuggestionClick} 
                      title="Nicht klicken! Selber tippen!"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              )}
              {isSubmitted && errors.month && <span className="error-msg">{errors.month}</span>}
            </div>

  
            <div className="date-part">
              <label tabIndex="0" className="sub-label">Jahr</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={isSubmitted && errors.year ? "error-border" : ""}
              />
              {isSubmitted && errors.year && <span className="error-msg">{errors.year}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn">Termin verbindlich anfragen</button>

          
          {isSubmitted && Object.keys(errors).length > 0 && (
            <div className="error-summary">
              <p>Es sind Fehler aufgetreten (siehe oben).</p>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}