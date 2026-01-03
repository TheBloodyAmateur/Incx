CREATE TABLE IF NOT EXISTS public.bookings
(
    id bigserial NOT NULL,
    session_id character varying(255) NOT NULL,
    
    salutation integer,                        
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255),
    zip character varying(20),
    city character varying(255),
    
    booking_date date NOT NULL,  
    created_at timestamp without time zone DEFAULT now(),
    
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    CONSTRAINT unique_session_date UNIQUE (session_id, booking_date)
);