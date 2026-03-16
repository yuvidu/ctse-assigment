package com.yuvidu.booking_service.service;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import com.yuvidu.booking_service.repository.BookingRepository;
import com.yuvidu.booking_service.model.Bookingmodel;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Bookingmodel createBooking(Bookingmodel booking) {
        booking.setStatus("PENDING");  
        booking.setCreatedAt(LocalDateTime.now());     
        return bookingRepository.save(booking);
    }

    public List<Bookingmodel> getAllBookings() {
        return bookingRepository.findAll();
    }


    
}
