package com.example.ims.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreatePurchaseOrderItemRequest {
    
    @NotBlank(message = "Product ID is required")
    private String productId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantityOrdered;
    
    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private double unitPrice;
    
    private String notes;
    
    // Optional fields for frontend compatibility
    private String id; // Frontend sends this as a temporary ID
    private int quantityReceived = 0; // Default to 0
    private Product product; // Frontend might send the full product object
} 