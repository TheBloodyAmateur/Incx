INSERT INTO public.improvements 
(page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
-- LoginPage Improvements
('LoginPage', 'username-input', 'INPUT', 
 'The username input field logic is confusing (toggles type based on dev mode).', 
 'Simplify input behavior and ensure consistent text visibility.',
 ''),
('LoginPage', 'login-submit', 'UX', 
 'The submit button lacks visual feedback when clicked or loading.', 
 'Add a loading spinner or disable the button during submission.',
 ''),
('LoginPage', 'login-header', 'VISUAL', 
 'The header font size is inconsistent with the rest of the application.', 
 'Standardize typography tokens across the authentication flow.',
 ''),

-- DashboardPage Improvements
('DashboardPage', 'feature-grid', 'LAYOUT', 
 'The feature icons grid is not responsive on smaller screens.', 
 'Implement a flexible grid layout with auto-fill columns.',
 ''),
('DashboardPage', 'feature-grid', 'NAVIGATION', 
 'Keyboard navigation order between icons is unpredictable.', 
 'Ensure logical tab-index order matching visual layout.',
 '');
