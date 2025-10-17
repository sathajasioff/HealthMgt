package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "pharmacies")
public class Pharmacy {
    @Id
    private String id;
    private String userId; // reference to User.id who owns this pharmacy account
    private String name;
    private String address;
    private String phone;
    private String email;
    private String hours;
    private Double rating;
    private String stock;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getStock() { return stock; }
    public void setStock(String stock) { this.stock = stock; }
}
