
DELETE FROM public.improvements WHERE page_name = 'BookingPage';

INSERT INTO public.improvements 
(page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 

-- F-M-12: Random Date Format
('BookingPage', 'date_split', 'layout', 
 'Randomly changing the date format (e.g., MM/DD/YYYY vs DD.MM.YYYY) on every refresh causes massive confusion and leads to input errors.', 
 'Enforce a consistent, locale-aware date format or use a standard date picker.', 
 ''),

-- F-M-13: Salutation Slider
('BookingPage', 'salutation', 'slider', 
 'Selecting a salutation via a slider is unintuitive because sliders are designed for continuous values (like volume), not discrete categories.', 
 'Use a Dropdown-List (Select) or Radio Buttons instead.', 
 ''),

-- F-M-14: Tab Focus on Labels (General Issue)
('BookingPage', '', 'navigation', 
 'Focusing static elements like labels during keyboard navigation (Tab) breaks the natural flow and slows down the user significantly.', 
 'Remove tabIndex from non-interactive elements. Only inputs and buttons should be focusable.', 
 ''),

-- F-M-15: Date Split (3 Fields)
('BookingPage', 'date_split', 'input_group', 
 'Splitting the date into three separate, disconnected fields increases cognitive load and requires unnecessary clicking.', 
 'Use a unified Date Picker component or a masked input field.', 
 ''),

-- F-M-16: Day Stepper (+/- Buttons only)
('BookingPage', 'date_split', 'stepper', 
 'Restricting the day input to "+" and "-" buttons makes entering distant dates tedious and frustrating.', 
 'Allow direct numeric input via the keyboard.', 
 ''),

-- F-M-17: Month Suggestions (Visual only)
('BookingPage', 'date_split', 'autosuggest', 
 'Displaying a suggestion list while typing without allowing the user to select an entry is misleading and frustrating.', 
 'Allow users to click and select from the suggestion list.', 
 ''),

-- F-M-18: Month Exact Spelling & Click Block
('BookingPage', 'date_split', 'validation', 
 'Blocking click selection and demanding exact case-sensitive spelling for months causes high error rates.', 
 'Implement a standard Select dropdown for months to prevent spelling errors.', 
 ''),

-- F-M-19: Email Hint (Early Error)
('BookingPage', 'email', 'input', 
 'Displaying an error message ("Must contain @") before the user has even finished typing is aggressive and distracting.', 
 'Validate fields "on blur" (when leaving the field) or after a short delay.', 
 ''),

-- F-M-20: Email Sequence Constraint
('BookingPage', 'email', 'input', 
 'Enforcing a specific typing order (entering "@" before the domain) violates standard mental models and typing patterns.', 
 'Allow standard free-form text input and validate the format afterwards.', 
 ''),

-- F-M-21: Late Validation (Submit)
('BookingPage', 'submit-btn', 'form_flow', 
 'Reporting validation errors or "date already taken" only after submission forces the user to context-switch and re-orient themselves.', 
 'Validate fields inline as the user types and check for availability in real-time if possible.', 
 ''),

-- F-M-22: Form Clear on Submit
('BookingPage', 'submit-btn', 'form_flow', 
 'Clearing the entire form after submission, especially if an error occurred, destroys user progress and forces re-entry.', 
 'Persist input data in case of errors. Only clear the form upon successful completion.', 
 ''),

-- F-S-9: Year Scroll (Scroll-Jacking)
('BookingPage', 'date_split', 'scroll_input', 
 'Requiring multiple scroll ticks to change a single year value ("Scroll-Jacking") feels unresponsive and annoying.', 
 'Allow standard numeric input or a simple dropdown for years.', 
 ''),

-- F-S-10: City/Zip Auto-Clear
('BookingPage', 'city', 'interaction', 
 'Automatically clearing the Zip code field when a City is selected destroys valid user input.', 
 'Auto-fill the Zip code if known, but do not delete an existing entry unless it conflicts.', 
 ''),

-- F-S-11: Tab Alphabetical Order (General Issue)
('BookingPage', '', 'navigation', 
 'Alphabetical tab order defies the visual layout (left-to-right, top-to-bottom), causing severe disorientation for keyboard users.', 
 'The tab order should strictly follow the visual DOM order.', 
 '');