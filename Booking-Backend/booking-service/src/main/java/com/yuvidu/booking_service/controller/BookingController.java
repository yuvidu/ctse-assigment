package com.yuvidu.booking_service.controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.yuvidu.booking_service.service.BookingService;
import com.yuvidu.booking_service.model.Bookingmodel;



@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Bookingmodel createBooking(@RequestBody Bookingmodel booking) {
        return bookingService.createBooking(booking);
    }
    
    @GetMapping
    public List<Bookingmodel> getBookings() {
        return bookingService.getAllBookings();
    }

    
    
    
}
