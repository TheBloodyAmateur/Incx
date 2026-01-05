-- Improvements for WeatherPage
INSERT INTO public.improvements (page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('WeatherPage', 'mode-switcher', 'UX', 'The mode switcher is hard to tap on mobile devices due to small hit area.', 'Increase padding and touch target size for better mobile usability.', 'TouchFriendlyToggle'),
('WeatherPage', 'main-temp', 'VISUAL', 'The current temperature display lacks contrast against certain dynamic backgrounds.', 'Add a subtle text-shadow or backdrop filter to ensure readability.', 'HighContrastLabel'),
('WeatherPage', 'stats-grid', 'LAYOUT', 'The statistics grid feels cluttered and lacks clear visual hierarchy.', 'Use a card-based layout with distinct headers for each statistic.', 'CardGrid');
