package com.example.ims.model;

import lombok.Data;

@Data
public class ProductWithCategoryRequest {
    private String categoryName;
    private String categoryDescription;
    private String categoryIcon;
    private Product product;
} 