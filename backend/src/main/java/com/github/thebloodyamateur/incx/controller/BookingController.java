package com.github.thebloodyamateur.incx.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.github.thebloodyamateur.incx.persistence.model.Booking;
import com.github.thebloodyamateur.incx.service.BookingService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/bookings") 
@AllArgsConstructor
public class BookingController {

    private final BookingService bookingService;


    @GetMapping
    public List<Booking> getMyBookings(@RequestParam String sessionId) {
        return bookingService.getBookingsBySession(sessionId);
    }


    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(savedBooking);
        } catch (IllegalArgumentException e) {
    
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }


    static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) { this.message = message; }
    }
}
