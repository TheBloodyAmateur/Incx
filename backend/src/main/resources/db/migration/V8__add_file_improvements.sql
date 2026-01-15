INSERT INTO public.improvements 
(page_name, ui_name, ui_type, description, improvement_proposal, improvement_component)
VALUES 
('FileStoragePage', 'Random size units', 'SIZE', 
 'The file size - units are changed whenever changes are done, which makes it difficult to have an effective understanding of the amount of data in displayed.', 
 'Units, or information in general, should be displayed in a unified manner.',
 ''),
('FileStoragePage', 'Replacing file names', 'NAME', 
 'The file name will be relpaced by a randomly generated string if it exceeds a certain number of characters.', 
 'If there are constrains on names, for example, indicate them to the user so they can choose different values that suits them.',
 ''),
('FileStoragePage', 'Items dissapearing', 'FILES', 
 'Files will randomly dissapear and reappear after a site reload.', 
 'Make sure that all the available content can be displayed or show appropriate error messages / handle errors properly.',
 '')