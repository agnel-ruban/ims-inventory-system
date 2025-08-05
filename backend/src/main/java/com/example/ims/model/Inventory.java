package com.example.ims.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.Date;

@Data
@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String inventoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"inventories", "hibernateLazyInitializer"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnoreProperties({"inventories", "hibernateLazyInitializer"})
    private Warehouse warehouse;

    @Min(value = 0, message = "Available quantity cannot be negative")
    private int quantityAvailable;

    @Min(value = 0, message = "Reserved quantity cannot be negative")
    private int quantityReserved;

    @Min(value = 0, message = "Damaged quantity cannot be negative")
    private int quantityDamaged;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = new Date();
    }

    public int getTotalQuantity() {
        return quantityAvailable + quantityReserved + quantityDamaged;
    }
}
