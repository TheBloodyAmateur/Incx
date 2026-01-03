package com.github.thebloodyamateur.incx.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.github.thebloodyamateur.incx.persistence.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findBySessionIdOrderByBookingDateAsc(String sessionId);


    boolean existsBySessionIdAndBookingDate(String sessionId, LocalDate bookingDate);
}