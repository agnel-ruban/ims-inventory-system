package com.example.ims.controller;

import com.example.ims.model.PurchaseOrder;
import com.example.ims.model.PurchaseOrderItem;
import com.example.ims.model.PurchaseOrderStatus;
import com.example.ims.model.CreatePurchaseOrderItemRequest;
import com.example.ims.service.PurchaseOrderService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/purchase-orders")
public class PurchaseOrderController {
    @Autowired
    private PurchaseOrderService purchaseOrderService;

    // Test endpoints removed - no longer needed

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPurchaseOrders() {

        
        try {
            List<PurchaseOrder> orders = purchaseOrderService.getAllPurchaseOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve purchase orders");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPurchaseOrderById(@PathVariable String id) {
        try {
            PurchaseOrder order = purchaseOrderService.getPurchaseOrderById(id);
            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Purchase order not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve purchase order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPurchaseOrder(
            @RequestParam String warehouseId,
            @RequestParam String supplierName,
            @RequestParam(required = false) String contactInfo,
            @RequestParam(required = false) String notes,
            @RequestBody List<Object> items) {
        
        // Debug logging

        
        try {
            // Convert the raw items to CreatePurchaseOrderItemRequest
            List<CreatePurchaseOrderItemRequest> requestItems = items.stream()
                .map(item -> {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        CreatePurchaseOrderItemRequest request = new CreatePurchaseOrderItemRequest();
                        request.setProductId((String) itemMap.get("productId"));
                        request.setQuantityOrdered(((Number) itemMap.get("quantityOrdered")).intValue());
                        request.setUnitPrice(((Number) itemMap.get("unitPrice")).doubleValue());
                        request.setNotes((String) itemMap.get("notes"));
                        return request;
                    }
                    throw new IllegalArgumentException("Invalid item format");
                })
                .toList();
            
            PurchaseOrder order = purchaseOrderService.createPurchaseOrder(
                warehouseId, supplierName, contactInfo, notes, requestItems);

            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            System.err.println("Entity not found: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Warehouse or product not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid argument: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid purchase order data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create purchase order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String id,
            @RequestParam PurchaseOrderStatus newStatus) {
        try {
            PurchaseOrder order = purchaseOrderService.updateOrderStatus(id, newStatus);
            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Purchase order not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid status transition");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update order status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> receiveItems(
            @PathVariable String id,
            @Valid @RequestBody List<PurchaseOrderItem> receivedItems) {
        try {
            PurchaseOrder order = purchaseOrderService.receiveItems(id, receivedItems);
            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Purchase order not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot receive items");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to receive items");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPurchaseOrdersByStatus(
            @PathVariable PurchaseOrderStatus status) {
        try {
            List<PurchaseOrder> orders = purchaseOrderService.getPurchaseOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve purchase orders by status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/warehouse/{warehouseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPurchaseOrdersByWarehouse(
            @PathVariable String warehouseId) {
        try {
            List<PurchaseOrder> orders = purchaseOrderService.getPurchaseOrdersByWarehouse(warehouseId);
            return ResponseEntity.ok(orders);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Warehouse not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve purchase orders by warehouse");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        try {
            List<PurchaseOrder> orders = purchaseOrderService.getOrdersInDateRange(startDate, endDate);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve purchase orders by date range");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePurchaseOrder(@PathVariable String id) {
        try {
            purchaseOrderService.deletePurchaseOrder(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Purchase order not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot delete purchase order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete purchase order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
