package com.example.ims.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

@Data
@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"purchaseOrderItems", "inventories", "hibernateLazyInitializer"})
    private Product product;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantityOrdered;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private double unitPrice;

    private int quantityReceived;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnoreProperties({"items", "hibernateLazyInitializer"})
    private PurchaseOrder purchaseOrder;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public double getSubtotal() {
        return quantityOrdered * unitPrice;
    }

    public boolean isFullyReceived() {
        return quantityReceived >= quantityOrdered;
    }
}
