package com.example.ims.controller;

import com.example.ims.model.Inventory;
import com.example.ims.service.InventoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@Validated
public class InventoryController {
    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<?> getAllInventories() {
        try {
            List<Inventory> inventories = inventoryService.getAllInventories();
            return ResponseEntity.ok(inventories);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventories");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getInventoryById(@PathVariable String id) {
        try {
            Inventory inventory = inventoryService.getInventoryById(id);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createInventory(
            @RequestParam String productId,
            @RequestParam String warehouseId,
            @RequestParam @Min(0) int initialQuantity) {
        try {
            Inventory inventory = inventoryService.createInventory(productId, warehouseId, initialQuantity);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product or warehouse not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid inventory data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable String id,
            @RequestParam @Min(0) int available,
            @RequestParam @Min(0) int reserved,
            @RequestParam @Min(0) int damaged) {
        try {
            Inventory inventory = inventoryService.updateStock(id, available, reserved, damaged);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid stock data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<?> reserveStock(
            @PathVariable String id,
            @RequestParam @Min(1) int quantity) {
        try {
            Inventory inventory = inventoryService.reserveStock(id, quantity);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Insufficient stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to reserve stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<?> releaseReservedStock(
            @PathVariable String id,
            @RequestParam @Min(1) int quantity) {
        try {
            Inventory inventory = inventoryService.releaseReservedStock(id, quantity);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Insufficient reserved stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to release reserved stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/mark-damaged")
    public ResponseEntity<?> markStockAsDamaged(
            @PathVariable String id,
            @RequestParam @Min(1) int quantity) {
        try {
            Inventory inventory = inventoryService.markStockAsDamaged(id, quantity);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Insufficient available stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark stock as damaged");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getInventoryByProduct(@PathVariable String productId) {
        try {
            List<Inventory> inventories = inventoryService.getInventoryByProduct(productId);
            return ResponseEntity.ok(inventories);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory by product");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getInventoryByWarehouse(@PathVariable String warehouseId) {
        try {
            List<Inventory> inventories = inventoryService.getInventoryByWarehouse(warehouseId);
            return ResponseEntity.ok(inventories);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Warehouse not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory by warehouse");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/product/{productId}/total-available")
    public ResponseEntity<?> getTotalAvailableStock(@PathVariable String productId) {
        try {
            int totalStock = inventoryService.getTotalAvailableStock(productId);
            return ResponseEntity.ok(totalStock);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve total available stock");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventory(@PathVariable String id) {
        try {
            inventoryService.deleteInventory(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventory(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        try {
            int available = (int) updateData.getOrDefault("quantityAvailable", 0);
            int reserved = (int) updateData.getOrDefault("quantityReserved", 0);
            int damaged = (int) updateData.getOrDefault("quantityDamaged", 0);
            
            Inventory inventory = inventoryService.updateStock(id, available, reserved, damaged);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid inventory data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/product/{productId}/warehouse/{warehouseId}")
    public ResponseEntity<?> getInventoryByProductAndWarehouse(
            @PathVariable String productId,
            @PathVariable String warehouseId) {
        try {
            Inventory inventory = inventoryService.getInventoryByProductAndWarehouse(productId, warehouseId);
            return ResponseEntity.ok(inventory);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Inventory not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockInventories() {
        try {
            List<Inventory> inventories = inventoryService.getLowStockInventories();
            return ResponseEntity.ok(inventories);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve low stock inventories");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    // Test endpoint to manually create inventory for debugging
    @PostMapping("/test-create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testCreateInventory(@RequestBody Map<String, Object> request) {
        try {
            String productId = (String) request.get("productId");
            String warehouseId = (String) request.get("warehouseId");
            Integer quantity = (Integer) request.getOrDefault("quantity", 0);
            
            if (productId == null || warehouseId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Missing required fields");
                errorResponse.put("message", "productId and warehouseId are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            Inventory inventory = inventoryService.createInventory(productId, warehouseId, quantity);
            return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create test inventory");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
