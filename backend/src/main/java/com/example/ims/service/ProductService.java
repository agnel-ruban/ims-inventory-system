package com.example.ims.service;

import com.example.ims.model.Category;
import com.example.ims.model.Product;
import com.example.ims.model.Inventory;
import com.example.ims.model.Warehouse;
import com.example.ims.repository.CategoryRepository;
import com.example.ims.repository.ProductRepository;
import com.example.ims.repository.InventoryRepository;
import com.example.ims.repository.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AlertService alertService;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getAllProductsWithInventory() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            List<Inventory> inventories = inventoryRepository.findByProduct(product);
            product.setInventories(inventories);
        }
        return products;
    }
    
    public Product getProductById(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));
    }
    
    public Product getProductBySku(String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with SKU: " + sku));
    }

    public Product createProduct(Product product) {


        // Check if SKU already exists
        if (productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + product.getSku() + "' already exists");
        }

        // Save the product first
        Product savedProduct = productRepository.save(product);


        // Determine initial stock quantity
        int stockQuantity;
        if (product.getInitialStock() != null && product.getInitialStock() > 0) {
            stockQuantity = product.getInitialStock();

        } else {
            // Use initialStock if provided, otherwise use SKU as initial stock quantity, or minimum threshold if SKU is not numeric
            try {
                // Try to parse SKU as a number for initial stock
                stockQuantity = Integer.parseInt(product.getSku());
    
            } catch (NumberFormatException e) {
                // If SKU is not a number, use minimum threshold as initial stock
                stockQuantity = product.getMinimumStockThreshold();
        
            }
        }

        // Create inventory entry
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        // Get warehouse by ID
        Warehouse warehouse = warehouseRepository.findById(product.getWarehouseId())
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with ID: " + product.getWarehouseId()));
        inventory.setWarehouse(warehouse);
        inventory.setQuantityAvailable(stockQuantity);
        inventory.setQuantityReserved(0);
        inventory.setQuantityDamaged(0);
        inventory.setLastUpdated(new Date());

        inventoryRepository.save(inventory);


        return savedProduct;
    }
    
    public Product createProductWithCategory(Product product) {
        return createProduct(product);
    }
    
    public Product updateProduct(String productId, Product productDetails) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + productId));

        // Check if SKU is being changed and if it already exists
        if (!product.getSku().equals(productDetails.getSku()) &&
                productRepository.existsBySku(productDetails.getSku())) {
            throw new IllegalArgumentException("Product with SKU '" + productDetails.getSku() + "' already exists");
        }

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setCategory(productDetails.getCategory());
        product.setWarehouseId(productDetails.getWarehouseId());
        product.setModel(productDetails.getModel());
        product.setUnitPrice(productDetails.getUnitPrice());
        product.setSku(productDetails.getSku());
        product.setMinimumStockThreshold(productDetails.getMinimumStockThreshold());
        product.setSpecifications(productDetails.getSpecifications());

        return productRepository.save(product);
    }
    
    public void deleteProduct(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new EntityNotFoundException("Product not found with ID: " + productId);
        }
        productRepository.deleteById(productId);
    }
    
    public List<Product> getProductsByCategory(String categoryName) {
        Category category = categoryRepository.findByName(categoryName)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + categoryName));
        return productRepository.findByCategory(category);
    }
    
    public boolean productExists(String sku) {
        return productRepository.existsBySku(sku);
    }
    
    public Product getProductWithInventory(String productId) {

        
        Product product = getProductById(productId);

        
        List<Inventory> inventories = inventoryRepository.findByProduct(product);
        product.setInventories(inventories);
        return product;
    }
    
    public List<Product> searchProducts(String searchTerm) {
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrModelContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm);
    }
}
