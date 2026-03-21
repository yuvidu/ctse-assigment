package com.yuvidu.booking_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "bookings")
public class Bookingmodel {

    @Id
    private String id;
    private String userId;
    private String showId;
    private List<String> seats;
    private String status;
    private Double ticketPrice;
    private LocalDateTime createdAt;
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getShowId() {
        return showId;
    }
    
    public void setShowId(String showId) {
        this.showId = showId;
    }
    
    public List<String> getSeats() {
        return seats;
    }
    
    public void setSeats(List<String> seats) {
        this.seats = seats;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Double getTicketPrice() {
        return ticketPrice;
    }
    
    public void setTicketPrice(Double ticketPrice) {
        this.ticketPrice = ticketPrice;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
}
