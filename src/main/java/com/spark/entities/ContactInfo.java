package com.spark.entities;
import jakarta.persistence.Embeddable;
@Embeddable
public class ContactInfo {
    private String contactPerson;
    private String phoneNumber;

    // getters and setters
}