import React, { useState, useEffect, useRef } from 'react';
import ImprovementWrapper from '../../components/imp/ImprovementWrapper';
import { useUX } from '../../context/UXContext'; // <--- PFAD ANPASSEN FALLS NÖTIG!
import "./BookingPage.css";

// --- DATEN ---
const MONTH_NAMES = [
  "JANUAR", "FEBRUAR", "MÄRZ", "APRIL", "MAI", "JUNI",
  "JULI", "AUGUST", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DEZEMBER"
];

const AUSTRIA_CITIES = [
    { name: "Wien", zip: "1010" },
    { name: "Graz", zip: "8010" },
    { name: "Linz", zip: "4020" },
    { name: "Salzburg", zip: "5020" },
    { name: "Innsbruck", zip: "6020" },
    { name: "Klagenfurt", zip: "9020" },
    { name: "Villach", zip: "9500" },
    { name: "Wels", zip: "4600" },
    { name: "St. Pölten", zip: "3100" },
    { name: "Dornbirn", zip: "6850" }
];

// --- HELPER ---
const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
const getFirstDayOfMonth = (month, year) => {
  let day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

// --- COOKIE HELPERS  ---
const saveBooking = (dateStr) => {
  const existing = JSON.parse(sessionStorage.getItem('incx_bookings') || '[]');
  existing.push(dateStr);
  sessionStorage.setItem('incx_bookings', JSON.stringify(existing));
};

const getBookings = () => {
  return JSON.parse(sessionStorage.getItem('incx_bookings') || '[]');
};

export default function BookingPage() {
  // --- 1. CONTEXT HOOKS ---
  const { highlightedId, setHighlight, hoverModeActive } = useUX();

  // --- STANDARD STATE ---
  const [dateFormat, setDateFormat] = useState("DE"); 
  const [currentDateString, setCurrentDateString] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [tabIndices, setTabIndices] = useState({}); 

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const initialFormState = {
    salutation: 1, 
    firstName: "",
    lastName: "",
    email: "",
    day: 1,
    month: "", 
    year: 2000,
    zip: "",     
    city: ""     
  };
  const [formData, setFormData] = useState(initialFormState);
  
  // UI Logik
  const [monthSuggestions, setMonthSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Scroll Logik (Jahr)
  const [scrollProgress, setScrollProgress] = useState(0); // -20 bis +20
  const SCROLL_THRESHOLD = 20;
  const yearScrollRef = useRef(null);

  // --- 2. HIGHLIGHTING LOGIK ---
  
  // Feuert nur, wenn Scan-Modus (hoverModeActive) an ist
  const handleMouseEnter = (id) => {
    if (hoverModeActive) {
      setHighlight(id);
    }
  };

  const handleMouseLeave = () => {
    if (hoverModeActive) {
      setHighlight(null);
    }
  };

  // Hilfsfunktion: Gibt CSS-Klassen zurück, wenn das Element markiert ist
  // Wir nutzen hier Tailwind-Klassen für den grünen Ring (ring-emerald-500)
  const getHighlightClass = (id) => {
    if (highlightedId === id) {
      return "ring-4 ring-emerald-500 ring-offset-2 ring-offset-[#0f0f0f] rounded transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 relative";
    }
    return "transition-all duration-200 border-transparent border";
  };


  useEffect(() => {
    // Format Logik
    const formats = [
      { code: "DE", label: "DD.MM.YYYY" }, 
      { code: "US", label: "MM/DD/YYYY" }, 
      { code: "ISO", label: "YYYY-MM-DD" }
    ];
    const selected = formats[Math.floor(Math.random() * formats.length)];
    setDateFormat(selected.code);

    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    
    let dateStr = "";
    if (selected.code === "DE") dateStr = `${d}.${m}.${y}`;
    else if (selected.code === "US") dateStr = `${m}/${d}/${y}`;
    else dateStr = `${y}-${m}-${d}`;
    
    setCurrentDateString(dateStr);
    setBookedDates(getBookings());

 
    const controlNames = [
        "salutation", 
        "firstName", 
        "lastName", 
        "zip", 
        "city", 
        "email", 
        "day", 
        "month", 
        "year", 
        "submit" 
    ];
    // Alphabetisch sortieren
    controlNames.sort();
    
    // Map erstellen: Name -> Index (Start bei 1)
    const indices = {};
    controlNames.forEach((name, index) => {
        indices[name] = index + 1;
    });
    setTabIndices(indices);

  }, []);

  
   useEffect(() => {
    const element = yearScrollRef.current;
    if (!element) return;

    const handleWheel = (e) => {
        e.preventDefault(); 
        
        const delta = e.deltaY > 0 ? -1 : 1; 

        setScrollProgress(prev => {
            let next = prev + delta;
            
            if (next >= SCROLL_THRESHOLD) {
                setFormData(f => ({ ...f, year: f.year + 1 }));
                return 0; 
            } else if (next <= -SCROLL_THRESHOLD) {
                setFormData(f => ({ ...f, year: f.year - 1 }));
                return 0; 
            }
            return next;
        });
    };

    // Option { passive: false } ist wichtig für preventDefault()
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
        if (element) element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const getSalutationLabel = (val) => {
    if (val == 0) return "Herr";
    if (val == 1) return "Frau";
    return "Keine Angabe";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Monat Vorschläge
    if (name === "month") {
      if (value.trim() === "") setMonthSuggestions([]);
      else setMonthSuggestions(MONTH_NAMES.filter(m => m.includes(value.toUpperCase())));
    }


    if (name === "city") {
        if (value.trim() === "") {
            setCitySuggestions([]);
        } else {
            // Case insensitive search
            const filtered = AUSTRIA_CITIES.filter(c => 
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setCitySuggestions(filtered);
        }
    }
  };


  const selectCity = (cityName) => {
      setFormData(prev => ({ 
          ...prev, 
          city: cityName,
          zip: "" //PLZ WIRD GELEERT
      }));
      setCitySuggestions([]);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key.length > 1) return; 
    const hasAt = formData.email.includes('@');
    if (!hasAt && e.key !== '@') e.preventDefault();
  };

  const adjustDay = (delta) => {
    setFormData(prev => {
      let newDay = parseInt(prev.day) + delta;
      if (newDay < 1) newDay = 1;
      if (newDay > 31) newDay = 31;
      return { ...prev, day: newDay };
    });
  };

  const handleMonthSuggestionClick = (e) => e.preventDefault();

 
  const handleYearScroll = (e) => {
      // Verhindern, dass die ganze Seite scrollt
      e.preventDefault();
      
      // Delta Y: positiv = runterscrollen, negativ = hochscrollen
      const delta = e.deltaY > 0 ? -1 : 1; 

      setScrollProgress(prev => {
          let next = prev + delta;
          
          // Limitieren und Trigger prüfen
          if (next >= SCROLL_THRESHOLD) {
              // +1 Jahr
              setFormData(f => ({ ...f, year: f.year + 1 }));
              return 0; // Reset
          } else if (next <= -SCROLL_THRESHOLD) {
              // -1 Jahr
              setFormData(f => ({ ...f, year: f.year - 1 }));
              return 0; // Reset
          }
          
          return next;
      });
  };

  const validate = () => {
    const newErrors = {};
    if (!MONTH_NAMES.includes(formData.month.toUpperCase())) newErrors.month = "Monat muss exakt ausgeschrieben sein.";
    if (!formData.firstName) newErrors.firstName = "Name fehlt.";
    if (!formData.lastName) newErrors.lastName = "Nachname fehlt.";
    if (!formData.zip) newErrors.zip = "PLZ fehlt.";
    if (!formData.city) newErrors.city = "Ort fehlt.";
    
    if (!formData.email.includes('@')) newErrors.email = "E-Mail muss ein @ enthalten.";
    else {
      const parts = formData.email.split('@');
      if (parts[0] === "" || parts[1] === "") newErrors.email = "E-Mail unvollständig.";
    }

    if (!formData.year) newErrors.year = "Jahr fehlt.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setIsSubmitted(true);

    if (Object.keys(validationErrors).length === 0) {
      const monthIndex = MONTH_NAMES.indexOf(formData.month.toUpperCase()) + 1;
      const mStr = String(monthIndex).padStart(2, '0');
      const dStr = String(formData.day).padStart(2, '0');
      const bookingIso = `${formData.year}-${mStr}-${dStr}`;

      saveBooking(bookingIso);
      setBookedDates(getBookings());
      alert(`Termin gebucht für: ${bookingIso} in ${formData.zip} ${formData.city}`);
    } else {
      alert("Fehlerhafte Eingaben. Bitte prüfen.");
    }
    setFormData(initialFormState);
    setMonthSuggestions([]);
    setCitySuggestions([]);
    setScrollProgress(0);
  };

  const enableInput = (e) => e.target.removeAttribute('readonly');


  const renderDayInput = () => (
    <div className="date-control-wrapper" key="day">
      <label tabIndex={tabIndices['day']} className="focusable-label">Tag</label>
      <div className="day-stepper">
        <button type="button" tabIndex={-1} onClick={() => adjustDay(-1)}>-</button>
        <input type="number" value={formData.day} readOnly className="day-input-readonly" tabIndex={-1} />
        <button type="button" tabIndex={-1} onClick={() => adjustDay(1)}>+</button>
      </div>
    </div>
  );

  const renderMonthInput = () => (
    <div className="date-control-wrapper relative" key="month">
      <label tabIndex={tabIndices['month']} className="focusable-label">Monat</label>
      <input
        type="text" name="month" value={formData.month}
        onChange={handleChange} onFocus={enableInput} readOnly autoComplete="off"
        className={isSubmitted && errors.month ? "error-border" : ""}
        placeholder="z.B. JANUAR"
        tabIndex={tabIndices['month']} 
      />
      {monthSuggestions.length > 0 && (
        <ul className="month-suggestions-list">
          {monthSuggestions.map(m => (
            <li key={m} onMouseDown={handleMonthSuggestionClick} title="Klicken verboten!">{m}</li>
          ))}
        </ul>
      )}
      {isSubmitted && errors.month && <div className="err-msg">{errors.month}</div>}
    </div>
  );

 
  const renderYearInput = () => {
      const progressPercent = (Math.abs(scrollProgress) / SCROLL_THRESHOLD) * 100;
      const barColor = scrollProgress > 0 ? '#4caf50' : '#f44336'; 

      return (
        <div className="date-control-wrapper" key="year">
          <label tabIndex={tabIndices['year']} className="focusable-label">Jahr (Scrollen)</label>
          <div 
            className="year-scroll-container" 
            ref={yearScrollRef} 
            title="Mausrad benutzen zum Ändern (+/- 20 Ticks)"
            tabIndex={tabIndices['year']}
          >
              <div className="year-display">{formData.year}</div>
              <div className="scroll-bar-container">
                  <div 
                    className="scroll-bar-fill" 
                    style={{
                        width: `${progressPercent}%`,
                        backgroundColor: barColor,
                        marginLeft: scrollProgress < 0 ? 'auto' : '0' 
                    }}
                  />
              </div>
          </div>
          {isSubmitted && errors.year && <div className="err-msg">{errors.year}</div>}
        </div>
      );
  };


  const getDateInputs = () => {
    const inputs = [];
    if (dateFormat === "US") {
      inputs.push(renderMonthInput()); inputs.push(renderDayInput()); inputs.push(renderYearInput());
    } else if (dateFormat === "ISO") {
      inputs.push(renderYearInput()); inputs.push(renderMonthInput()); inputs.push(renderDayInput());
    } else {
      inputs.push(renderDayInput()); inputs.push(renderMonthInput()); inputs.push(renderYearInput());
    }
    return inputs;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const startDay = getFirstDayOfMonth(currentMonth, currentYear); 
    const weeks = [];
    let dayCount = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || dayCount > daysInMonth) week.push(null); 
        else {
          const isToday = dayCount === today.getDate();
          const checkIso = `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(dayCount).padStart(2,'0')}`;
          week.push({ day: dayCount, isToday, isBooked: bookedDates.includes(checkIso) });
          dayCount++;
        }
      }
      weeks.push(week);
      if (dayCount > daysInMonth) break;
    }
    return (
      <div className="mini-calendar">
        <div className="cal-header">{MONTH_NAMES[currentMonth-1]} {currentYear}</div>
        <div className="cal-grid-header"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>
        <div className="cal-body">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="cal-row">
              {week.map((cell, dIdx) => (
                <div key={dIdx} className={`cal-cell ${cell?.isToday?'today':''} ${cell?.isBooked?'booked':''}`}>{cell?cell.day:''}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="cal-legend"><span className="dot today-dot"></span> Heute <span className="dot booked-dot"></span> Gebucht</div>
      </div>
    );
  };

  return (
    <ImprovementWrapper>
      <div className="booking-page-root">
        <div className="top-bar">
          <h2>Terminbuchung</h2>
          <div className="today-display">Heute: {currentDateString}</div>
        </div>

        <div className="content-split">
          <div className="form-section">
              <form onSubmit={handleSubmit} autoComplete="off">
                  <input type="text" style={{display: 'none'}} />
                  <input type="password" style={{display: 'none'}} />

                  <div className="form-group">
              
                      <label tabIndex={tabIndices['salutation']} className="focusable-label">Anrede</label>
                      
                      {/* --- 3. TARGET: ANREDE SLIDER --- */}
                      {/* Hier fügen wir die Klasse und Events für das Highlighting hinzu */}
                      <div 
                        className={`slider-wrapper ${getHighlightClass('salutation')}`}
                        onMouseEnter={() => handleMouseEnter('salutation')}
                        onMouseLeave={handleMouseLeave}
                      >
                          <input 
                              type="range" min="0" max="2" step="1" 
                              name="salutation" value={formData.salutation} 
                              onChange={handleChange} className="salutation-slider"
                              tabIndex={tabIndices['salutation']}
                          />
                          <div className="slider-val">{getSalutationLabel(formData.salutation)}</div>
                      </div>
                  </div>

                  <div className="form-group">
                      <label tabIndex={tabIndices['firstName']} className="focusable-label">Name</label>
                      <input 
                          type="text" name="firstName" value={formData.firstName} 
                          onChange={handleChange} onFocus={enableInput} readOnly autoComplete="off" 
                          className={isSubmitted && errors.firstName ? "error-border" : ""}
                          tabIndex={tabIndices['firstName']}
                      />
                      {isSubmitted && errors.firstName && <div className="err-msg">{errors.firstName}</div>}
                  </div>

                  <div className="form-group">
                      <label tabIndex={tabIndices['lastName']} className="focusable-label">Nachname</label>
                      <input 
                          type="text" name="lastName" value={formData.lastName} 
                          onChange={handleChange} onFocus={enableInput} readOnly autoComplete="off" 
                          className={isSubmitted && errors.lastName ? "error-border" : ""}
                          tabIndex={tabIndices['lastName']}
                      />
                      {isSubmitted && errors.lastName && <div className="err-msg">{errors.lastName}</div>}
                  </div>

          
                  <div className="form-group" >
                      <div className="city-row">
                      <div >
                          <label tabIndex={tabIndices['zip']} className="focusable-label">PLZ  </label>
                          <input 
                              type="number" name="zip" value={formData.zip} 
                              onChange={handleChange} onFocus={enableInput} readOnly autoComplete="off"
                              className={isSubmitted && errors.zip ? "error-border" : ""}
                              tabIndex={tabIndices['zip']}
                          />
                          {isSubmitted && errors.zip && <div className="err-msg">{errors.zip}</div>}
                      </div>
                      
                      <div >
                          <label tabIndex={tabIndices['city']} className="focusable-label">Ort  </label>
                          <input 
                              type="text" name="city" value={formData.city} 
                              onChange={handleChange} onFocus={enableInput} readOnly autoComplete="off"
                              className={isSubmitted && errors.city ? "error-border" : ""}
                              tabIndex={tabIndices['city']}
                          />
          
                          {citySuggestions.length > 0 && (
                              <ul className="city-suggestions-list">
                                  {citySuggestions.map(c => (
                                      <li key={c.zip} onClick={() => selectCity(c.name)}>
                                          {c.name} ({c.zip})
                                      </li>
                                  ))}
                              </ul>
                          )}
                          {isSubmitted && errors.city && <div className="err-msg">{errors.city}</div>}
                      </div>
                      </div>
                  </div>

                  <div className="form-group">
                      <label tabIndex={tabIndices['email']} className="focusable-label">E-Mail</label>
                      {!formData.email && <div className="info-hint">Hinweis: Eine E-Mail muss ein @ enthalten.</div>}
                      <input 
                          type="text" name="email" value={formData.email} 
                          onChange={handleChange} onKeyDown={handleEmailKeyDown} 
                          onFocus={enableInput} readOnly autoComplete="off" 
                          placeholder="Tippe zuerst @" className={isSubmitted && errors.email ? "error-border" : ""}
                          tabIndex={tabIndices['email']}
                      />
                      {isSubmitted && errors.email && <div className="err-msg">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                      <label tabIndex={0} className="focusable-label" style={{width:'100%'}}>Wunschtermin</label>
                      <div className="date-row">{getDateInputs()}</div>
                  </div>

                  {/* --- 4. TARGET: SUBMIT BUTTON --- */}
                  <button 
                    type="submit" 
                    className={`submit-btn ${getHighlightClass('submit-btn')}`} 
                    tabIndex={tabIndices['submit']}
                    onMouseEnter={() => handleMouseEnter('submit-btn')}
                    onMouseLeave={handleMouseLeave}
                  >
                    Termin verbindlich anfragen
                  </button>
              </form>
          </div>
          <div className="calendar-section">{renderCalendar()}</div>
        </div>
      </div>
    </ImprovementWrapper>
  );
}
