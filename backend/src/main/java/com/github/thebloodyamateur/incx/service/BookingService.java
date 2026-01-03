package com.github.thebloodyamateur.incx.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.github.thebloodyamateur.incx.persistence.model.Booking;
import com.github.thebloodyamateur.incx.persistence.repository.BookingRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j(topic = "BookingService")
public class BookingService {

    private final BookingRepository bookingRepository;


    public Booking createBooking(Booking booking) {
        log.info("Versuche Buchung für Datum {} (Session: {})", booking.getBookingDate(), booking.getSessionId());


        if (bookingRepository.existsBySessionIdAndBookingDate(booking.getSessionId(), booking.getBookingDate())) {
            log.warn("Termin {} ist für Session {} bereits belegt!", booking.getBookingDate(), booking.getSessionId());
            throw new IllegalArgumentException("Du hast diesen Termin bereits gebucht.");
        }

        return bookingRepository.save(booking);
    }

  
    public List<Booking> getBookingsBySession(String sessionId) {
        return bookingRepository.findBySessionIdOrderByBookingDateAsc(sessionId);
    }
}
