package com.example.ims.service;

import com.example.ims.model.Inventory;
import com.example.ims.model.Product;
import com.example.ims.model.Warehouse;
import com.example.ims.repository.InventoryRepository;
import com.example.ims.repository.ProductRepository;
import com.example.ims.repository.WarehouseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {
    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private AlertService alertService;

    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryById(String id) {
        return inventoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));
    }

    @Transactional
    public Inventory createInventory(String productId, String warehouseId, int initialQuantity) {

        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));

        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));


        // Check if inventory already exists for this product-warehouse combination
        Inventory existingInventory = inventoryRepository
            .findByProductAndWarehouse(product, warehouse);
        
        if (existingInventory != null) {
    
            throw new IllegalStateException("Inventory already exists for this product in the warehouse");
        }

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);
        inventory.setQuantityAvailable(initialQuantity);
        inventory.setQuantityReserved(0);
        inventory.setQuantityDamaged(0);

        Inventory savedInventory = inventoryRepository.save(inventory);

        return savedInventory;
    }

    @Transactional
    public Inventory updateStock(String inventoryId, int available, int reserved, int damaged) {
        Inventory inventory = getInventoryById(inventoryId);
        
        if (available < 0 || reserved < 0 || damaged < 0) {
            throw new IllegalArgumentException("Stock quantities cannot be negative");
        }

        inventory.setQuantityAvailable(available);
        inventory.setQuantityReserved(reserved);
        inventory.setQuantityDamaged(damaged);

        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Check if alert should be generated after stock update
        try {
            alertService.checkAndCreateAlertForProduct(inventory.getProduct().getProductId(), inventory.getWarehouse().getWarehouseId());
        } catch (Exception e) {
            System.err.println("Failed to check alert after stock update: " + e.getMessage());
        }

        return savedInventory;
    }

    @Transactional
    public Inventory reserveStock(String inventoryId, int quantity) {
        Inventory inventory = getInventoryById(inventoryId);
        
        if (quantity > inventory.getQuantityAvailable()) {
            throw new IllegalStateException("Not enough available stock to reserve");
        }

        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - quantity);
        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);

        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Check if alert should be generated after stock reduction
        try {
            alertService.checkAndCreateAlertForProduct(inventory.getProduct().getProductId(), inventory.getWarehouse().getWarehouseId());
        } catch (Exception e) {
            System.err.println("Failed to check alert after stock reservation: " + e.getMessage());
        }

        return savedInventory;
    }

    @Transactional
    public Inventory releaseReservedStock(String inventoryId, int quantity) {
        Inventory inventory = getInventoryById(inventoryId);
        
        if (quantity > inventory.getQuantityReserved()) {
            throw new IllegalStateException("Cannot release more than reserved quantity");
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - quantity);
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + quantity);

        return inventoryRepository.save(inventory);
    }

    @Transactional
    public Inventory markStockAsDamaged(String inventoryId, int quantity) {
        Inventory inventory = getInventoryById(inventoryId);
        
        if (quantity > inventory.getQuantityAvailable()) {
            throw new IllegalStateException("Cannot mark more items as damaged than available");
        }

        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - quantity);
        inventory.setQuantityDamaged(inventory.getQuantityDamaged() + quantity);

        Inventory savedInventory = inventoryRepository.save(inventory);
        
        // Check if alert should be generated after stock reduction
        try {
            alertService.checkAndCreateAlertForProduct(inventory.getProduct().getProductId(), inventory.getWarehouse().getWarehouseId());
        } catch (Exception e) {
            System.err.println("Failed to check alert after marking stock as damaged: " + e.getMessage());
        }

        return savedInventory;
    }

    public List<Inventory> getInventoryByProduct(String productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        return inventoryRepository.findByProduct(product);
    }

    public List<Inventory> getInventoryByWarehouse(String warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));
        return inventoryRepository.findByWarehouse(warehouse);
    }

    public int getTotalAvailableStock(String productId) {
        List<Inventory> inventories = getInventoryByProduct(productId);
        return inventories.stream()
            .mapToInt(Inventory::getQuantityAvailable)
            .sum();
    }

    @Transactional
    public void deleteInventory(String id) {
        if (!inventoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Inventory not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    public Inventory getInventoryByProductAndWarehouse(String productId, String warehouseId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));
        
        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse);
        if (inventory == null) {
            throw new EntityNotFoundException("Inventory not found for product " + productId + " in warehouse " + warehouseId);
        }
        
        return inventory;
    }

    public List<Inventory> getLowStockInventories() {
        return inventoryRepository.findLowStockInventories();
    }
}
