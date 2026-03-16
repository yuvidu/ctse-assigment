package com.yuvidu.booking_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.yuvidu.booking_service.model.Bookingmodel;

public interface BookingRepository 
    extends MongoRepository<Bookingmodel, String> {
}
