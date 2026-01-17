-- Remove the specific old 'main-temp' improvement from the original set
DELETE FROM public.improvements 
WHERE page_name = 'WeatherPage' 
  AND ui_name = 'main-temp' 
  AND description LIKE 'The current temperature display lacks contrast%';
