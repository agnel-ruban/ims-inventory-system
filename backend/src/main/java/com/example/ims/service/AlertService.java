package com.example.ims.service;

import com.example.ims.model.*;
import com.example.ims.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class AlertService {
    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Alert> getAllAlerts() {
        List<Alert> alerts = alertRepository.findAll();

        for (Alert alert : alerts) {

        }
        return alerts;
    }

    public Alert getAlertById(String id) {
        return alertRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alert not found with id: " + id));
    }

    @Transactional
    public Alert createAlert(String productId, String warehouseId, int threshold, String notes) {

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));

        // Check if alert already exists
        Alert existingAlert = alertRepository.findByProductAndWarehouseAndStatus(
            product, warehouse, AlertStatus.ACTIVE);
        
        if (existingAlert != null) {
            throw new IllegalStateException("Active alert already exists for this product in the warehouse");
        }

        // Get current stock level
        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse);
        if (inventory == null) {
            throw new IllegalStateException("No inventory found for this product in the warehouse");
        }

        // Calculate reorder suggestions
        int currentStock = inventory.getQuantityAvailable();
        int optimalStockLevel = calculateOptimalStockLevel(product, threshold);
        int suggestedReorderQuantity = calculateSuggestedReorderQuantity(currentStock, optimalStockLevel);

        Alert alert = new Alert();
        alert.setProduct(product);
        alert.setWarehouse(warehouse);
        alert.setThreshold(threshold);
        alert.setCurrentStock(currentStock);
        alert.setSuggestedReorderQuantity(suggestedReorderQuantity);
        alert.setOptimalStockLevel(optimalStockLevel);
        alert.setNotes(notes);
        alert.setStatus(AlertStatus.ACTIVE);

        return alertRepository.save(alert);
    }

    @Transactional
    public Alert updateAlertStatus(String alertId, AlertStatus newStatus, String notes) {
        Alert alert = getAlertById(alertId);
        
        if (alert.getStatus() == AlertStatus.RESOLVED) {
            throw new IllegalStateException("Cannot update a resolved alert");
        }

        alert.setStatus(newStatus);
        if (notes != null && !notes.isEmpty()) {
            alert.setNotes(notes);
        }

        return alertRepository.save(alert);
    }

    @Transactional
    public Alert acknowledgeAlert(String alertId) {
        Alert alert = getAlertById(alertId);
        
        if (alert.getStatus() != AlertStatus.ACTIVE) {
            throw new IllegalStateException("Can only acknowledge active alerts");
        }

        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        return alertRepository.save(alert);
    }

    @Transactional
    public void checkAndUpdateAlerts(String productId, String warehouseId, int newStockLevel) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));

        List<Alert> activeAlerts = alertRepository.findByProductAndWarehouseAndStatusIn(
            product, warehouse, List.of(AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED));

        for (Alert alert : activeAlerts) {
            alert.setCurrentStock(newStockLevel);
            
            if (newStockLevel > alert.getThreshold()) {
                alert.setStatus(AlertStatus.RESOLVED);
                alert.setNotes(alert.getNotes() + "\nResolved automatically - Stock level above threshold");
            }
            
            alertRepository.save(alert);
        }
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void checkLowStockLevels() {

        checkLowStockLevelsInternal();

    }

    @Transactional
    public void checkLowStockLevelsInternal() {
        List<Inventory> lowStockInventories = inventoryRepository.findLowStockInventories();
        
        for (Inventory inventory : lowStockInventories) {
            Alert existingAlert = alertRepository.findByProductAndWarehouseAndStatus(
                inventory.getProduct(), inventory.getWarehouse(), AlertStatus.ACTIVE);
            
            if (existingAlert == null) {
                // Calculate reorder suggestions
                int currentStock = inventory.getQuantityAvailable();
                int threshold = inventory.getProduct().getMinimumStockThreshold();
                int optimalStockLevel = calculateOptimalStockLevel(inventory.getProduct(), threshold);
                int suggestedReorderQuantity = calculateSuggestedReorderQuantity(currentStock, optimalStockLevel);

                Alert alert = new Alert();
                alert.setProduct(inventory.getProduct());
                alert.setWarehouse(inventory.getWarehouse());
                alert.setThreshold(threshold);
                alert.setCurrentStock(currentStock);
                alert.setSuggestedReorderQuantity(suggestedReorderQuantity);
                alert.setOptimalStockLevel(optimalStockLevel);
                alert.setStatus(AlertStatus.ACTIVE);
                alert.setNotes("Automatically generated low stock alert with reorder suggestions");
                
                alertRepository.save(alert);
            }
        }
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatus(AlertStatus.ACTIVE);
    }

    public List<Alert> getAlertsByProduct(String productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
        return alertRepository.findByProduct(product);
    }

    public List<Alert> getAlertsByWarehouse(String warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));
        return alertRepository.findByWarehouse(warehouse);
    }

    public List<Alert> getAlertsByStatus(AlertStatus status) {
        return alertRepository.findByStatus(status);
    }

    public List<Alert> getAlertsCreatedAfter(Date date) {
        return alertRepository.findAlertsCreatedAfter(date);
    }

    public List<Alert> getActiveAlertsBelowThreshold() {
        return alertRepository.findActiveAlertsBelowThreshold(AlertStatus.ACTIVE);
    }

    public long getLowStockAlertsCount() {
        return alertRepository.countByStatus(AlertStatus.ACTIVE);
    }

    /**
     * Manually trigger alert checking for all products
     */
    @Transactional
    public void triggerAlertCheck() {

        checkLowStockLevelsInternal();

    }

    /**
     * Check and create alert for specific product and warehouse
     */
    @Transactional
    public void checkAndCreateAlertForProduct(String productId, String warehouseId) {

        try {
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
            
            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new EntityNotFoundException("Warehouse not found"));
            
            Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse);
            
            if (inventory != null) {
                // Check if stock is below threshold - create alert
                if (inventory.getQuantityAvailable() <= product.getMinimumStockThreshold()) {
                    Alert existingAlert = alertRepository.findByProductAndWarehouseAndStatus(product, warehouse, AlertStatus.ACTIVE);
                    if (existingAlert == null) {
                        createAlert(productId, warehouseId, product.getMinimumStockThreshold(), 
                            "Automatically generated alert for low stock product");
            
                    }
                } else {
                    // Stock is above threshold - resolve any active alerts
                    Alert existingAlert = alertRepository.findByProductAndWarehouseAndStatus(product, warehouse, AlertStatus.ACTIVE);
                    if (existingAlert != null) {
                        existingAlert.setStatus(AlertStatus.RESOLVED);
                        existingAlert.setNotes("Stock restored above threshold - automatically resolved");
                        alertRepository.save(existingAlert);
            
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to check/create alert for product " + productId + ": " + e.getMessage());
        }
    }

    /**
     * Calculate optimal stock level based on product characteristics
     * Formula: threshold * 3 (for safety stock + lead time buffer)
     */
    private int calculateOptimalStockLevel(Product product, int threshold) {
        // Base calculation: threshold * 3 for safety stock
        int baseOptimal = threshold * 3;
        
        // Adjust based on product price (higher value = more safety stock)
        if (product.getUnitPrice() > 1000) {
            baseOptimal = (int) (baseOptimal * 1.5); // 50% more for expensive items
        }
        
        // Minimum optimal level should be at least threshold * 2
        return Math.max(baseOptimal, threshold * 2);
    }

    /**
     * Calculate suggested reorder quantity
     * Formula: optimal stock level - current stock + safety buffer
     */
    private int calculateSuggestedReorderQuantity(int currentStock, int optimalStockLevel) {
        int deficit = optimalStockLevel - currentStock;
        int safetyBuffer = (int) (deficit * 0.2); // 20% safety buffer
        return Math.max(deficit + safetyBuffer, 1); // Minimum 1 unit
    }

    @Transactional
    public void deleteAlert(String id) {
        Alert alert = getAlertById(id);
        
        if (alert.getStatus() == AlertStatus.ACTIVE) {
            throw new IllegalStateException("Cannot delete active alerts");
        }
        
        alertRepository.delete(alert);
    }

    /**
     * Debug method to check inventory status
     */
    public Map<String, Object> getInventoryDebugInfo() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            List<Inventory> allInventories = inventoryRepository.findAll();
            List<Inventory> lowStockInventories = inventoryRepository.findLowStockInventories();
            
            debugInfo.put("totalInventories", allInventories.size());
            debugInfo.put("lowStockInventories", lowStockInventories.size());
            
            List<Map<String, Object>> lowStockDetails = new ArrayList<>();
            for (Inventory inventory : lowStockInventories) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("productName", inventory.getProduct().getName());
                detail.put("warehouseName", inventory.getWarehouse().getName());
                detail.put("currentStock", inventory.getQuantityAvailable());
                detail.put("threshold", inventory.getProduct().getMinimumStockThreshold());
                detail.put("productId", inventory.getProduct().getProductId());
                detail.put("warehouseId", inventory.getWarehouse().getWarehouseId());
                lowStockDetails.add(detail);
            }
            debugInfo.put("lowStockDetails", lowStockDetails);
            
            // Check existing alerts
            List<Alert> activeAlerts = alertRepository.findByStatus(AlertStatus.ACTIVE);
            debugInfo.put("activeAlertsCount", activeAlerts.size());
            
            
            
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            System.err.println("Error in getInventoryDebugInfo: " + e.getMessage());
            e.printStackTrace();
        }
        
        return debugInfo;
    }
}
