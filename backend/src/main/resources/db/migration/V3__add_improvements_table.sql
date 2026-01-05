CREATE TABLE IF NOT EXISTS public.improvements
(
    id bigserial NOT NULL,
    page_name character varying(255) NOT NULL,        -- z.B. "BookingPage"
    ui_name character varying(255),                   -- z.B. "salutation_slider" (kann NULL sein für generelle Page-Infos)
    ui_type character varying(50),                    -- z.B. "slider", "input", "layout"
    description text,                                 -- Warum ist das schlecht?
    improvement_proposal text,                        -- Wie geht es besser?
    improvement_component text,                       -- React Component Name oder HTML Snippet
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT improvements_pkey PRIMARY KEY (id)
);

-- Optional: Ein paar Dummy-Daten zum Testen direkt einfügen
INSERT INTO public.improvements (page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('BookingPage', 'salutation', 'slider', 'Die Auswahl einer Anrede über einen Slider ist unintuitiv, da Slider für kontinuierliche Werte (wie Lautstärke) gedacht sind, nicht für diskrete Kategorien.', 'Verwenden Sie stattdessen eine Dropdown-Liste (Select) oder Radio-Buttons.', 'GoodSelectComponent'),
('BookingPage', 'date_split', 'input_group', 'Das Datum auf drei separate Felder ohne logische Reihenfolge aufzuteilen, erhöht die kognitive Last und Fehlerquote.', 'Nutzen Sie einen Standard Date-Picker oder ein maskiertes Eingabefeld.', 'GoodDatePicker'),
('WeatherPage', 'mode-switcher', 'UX', 'The mode switcher is hard to tap on mobile devices due to small hit area.', 'Increase padding and touch target size for better mobile usability.', 'TouchFriendlyToggle'),
('WeatherPage', 'main-temp', 'VISUAL', 'The current temperature display lacks contrast against certain dynamic backgrounds.', 'Add a subtle text-shadow or backdrop filter to ensure readability.', 'HighContrastLabel'),
('WeatherPage', 'stats-grid', 'LAYOUT', 'The statistics grid feels cluttered and lacks clear visual hierarchy.', 'Use a card-based layout with distinct headers for each statistic.', 'CardGrid');