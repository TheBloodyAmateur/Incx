-- 1. CLEANUP (Remove old/unwanted improvements)
DELETE FROM public.improvements WHERE page_name = 'WeatherPage' AND ui_name = 'mode-switcher';
DELETE FROM public.improvements WHERE page_name = 'WeatherPage' AND ui_name = 'stats-grid';
DELETE FROM public.improvements WHERE page_name = 'LoginPage';
DELETE FROM public.improvements WHERE page_name = 'DashboardPage';

-- 2. INSERT NEW IMPROVEMENTS

-- Login Page
INSERT INTO public.improvements (page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('LoginPage', 'username-input', 'LOGIC', 
 'Inputs are swapped (Username field takes Password, Password field takes Username).', 
 'Correct the input mapping to avoid user confusion.',
 '');

-- Dashboard Page
INSERT INTO public.improvements (page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('DashboardPage', 'feature-grid', 'INTERACTION', 
 'Buttons move/jump unexpectedly interaction.', 
 'Disable random movement effects on interactive elements.',
 ''),
('DashboardPage', 'dashboard-wrapper', 'VISUAL', 
 'Background style is inconsistent with other pages.', 
 'Implement a unified background (e.g., solid dark or specific gradient) across the whole app.',
 ''),
('DashboardPage', 'app-feature-icons', 'ACCESSIBILITY', 
 'Labels are hidden or hard to see.', 
 'Ensure labels are always visible and have high contrast.',
 '');

-- Weather Page
INSERT INTO public.improvements (page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('WeatherPage', 'main-temp', 'VISUAL', 
 'Temperature background is inverted (Red=Cold, Blue=Warm).', 
 'Use standard color logic: Blue for Cold, Red for Warm.',
 ''),
('WeatherPage', 'main-temp', 'ACCESSIBILITY', 
 'Text contrast is poor (e.g., Red text on Red bg).', 
 'Improve text contrast ratio for better readability.',
 ''),
('WeatherPage', 'weather-overlay', 'ANIMATION', 
 'Animations (shake, flash) are excessive and disturbing.', 
 'Reduce animation intensity or provide a "Reduced Motion" toggle.',
 ''),
('WeatherPage', 'weather-container', 'VISUAL', 
 'Background changes too drastically between weather modes.', 
 'Use a consistent background style for all weather conditions.',
 '');
