package com.example.ims.dto;

import com.example.ims.model.Product;
import com.example.ims.model.Category;
import com.example.ims.model.Inventory;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
public class ProductWithStockDTO {
    private String productId;
    private String name;
    private String description;
    private Category category;  // Changed from String to Category
    private String brand;
    private String model;
    private Double unitPrice;
    private String sku;
    private int minimumStockThreshold;
    private Map<String, String> specifications;
    private LocalDateTime createdAt;  // Changed from Date to LocalDateTime
    private LocalDateTime updatedAt;  // Changed from Date to LocalDateTime
    
    // Stock information
    private int totalAvailableStock;
    private int totalReservedStock;
    private int totalDamagedStock;
    private boolean inStock;
    private String stockStatus; // "In Stock", "Low Stock", "Out of Stock"
    
    public static ProductWithStockDTO fromProduct(Product product, int totalAvailable, int totalReserved, int totalDamaged) {
        ProductWithStockDTO dto = new ProductWithStockDTO();
        
        // Copy product information
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());  // Now correctly sets Category object
        dto.setBrand(product.getBrand());
        dto.setModel(product.getModel());
        dto.setUnitPrice(product.getUnitPrice());
        dto.setSku(product.getSku());
        dto.setMinimumStockThreshold(product.getMinimumStockThreshold());
        dto.setSpecifications(product.getSpecifications());
        dto.setCreatedAt(product.getCreatedAt());  // Now correctly sets LocalDateTime
        dto.setUpdatedAt(product.getUpdatedAt());  // Now correctly sets LocalDateTime
        
        // Set stock information
        dto.setTotalAvailableStock(totalAvailable);
        dto.setTotalReservedStock(totalReserved);
        dto.setTotalDamagedStock(totalDamaged);
        dto.setInStock(totalAvailable > 0);
        
        // Determine stock status
        if (totalAvailable == 0) {
            dto.setStockStatus("Out of Stock");
        } else if (totalAvailable <= product.getMinimumStockThreshold()) {
            dto.setStockStatus("Low Stock");
        } else {
            dto.setStockStatus("In Stock");
        }
        
        return dto;
    }
} 