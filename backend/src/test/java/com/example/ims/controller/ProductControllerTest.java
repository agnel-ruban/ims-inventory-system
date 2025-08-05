//package com.example.ims.controller;
//
//import com.example.ims.model.Product;
//import com.example.ims.model.Category;
//import com.example.ims.service.ProductService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@WebMvcTest(ProductController.class)
//public class ProductControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private ProductService productService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    public void testGetAllProducts() throws Exception {
//        // Create test category
//        Category testCategory = new Category();
//        testCategory.setCategoryId("cat-1");
//        testCategory.setName("Electronics");
//        testCategory.setDescription("Electronic products");
//
//        // Create test product
//        Product testProduct = new Product();
//        testProduct.setProductId("prod-1");
//        testProduct.setName("Test Product");
//        testProduct.setDescription("Test Description");
//        testProduct.setCategory(testCategory);  // Use Category object instead of String
//        testProduct.setBrand("Test Brand");
//        testProduct.setModel("Test Model");
//        testProduct.setSku("SKU-001");
//        testProduct.setUnitPrice(99.99);
//        testProduct.setMinimumStockThreshold(10);
//
//        Map<String, String> specs = new HashMap<>();
//        specs.put("color", "black");
//        testProduct.setSpecifications(specs);
//
//        List<Product> products = Arrays.asList(testProduct);
//        when(productService.getAllProducts()).thenReturn(products);
//
//        mockMvc.perform(get("/api/products"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].productId").value("prod-1"))
//                .andExpect(jsonPath("$[0].name").value("Test Product"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    public void testGetProductById() throws Exception {
//        // Create test category
//        Category testCategory = new Category();
//        testCategory.setCategoryId("cat-1");
//        testCategory.setName("Electronics");
//
//        Product testProduct = new Product();
//        testProduct.setProductId("prod-1");
//        testProduct.setName("Test Product");
//        testProduct.setCategory(testCategory);  // Use Category object instead of String
//
//        when(productService.getProductById("prod-1")).thenReturn(testProduct);
//
//        mockMvc.perform(get("/api/products/prod-1"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.productId").value("prod-1"));
//    }
//}
