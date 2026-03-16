package com.yuvidu.booking_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.yuvidu.booking_service.model.Bookingmodel;
import java.util.List;

public interface BookingRepository 
    extends MongoRepository<Bookingmodel, String> {
    
    List<Bookingmodel> findByUserId(String userId);
}
