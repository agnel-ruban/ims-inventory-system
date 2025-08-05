package com.example.ims.controller;

import com.example.ims.model.Alert;
import com.example.ims.model.AlertStatus;
import com.example.ims.service.AlertService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@Validated
public class AlertController {
    @Autowired
    private AlertService alertService;

    @GetMapping
    public ResponseEntity<?> getAllAlerts() {
        try {
            List<Alert> alerts = alertService.getAllAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAlertById(@PathVariable String id) {
        try {
            Alert alert = alertService.getAlertById(id);
            return ResponseEntity.ok(alert);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Alert not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createAlert(
            @RequestParam String productId,
            @RequestParam String warehouseId,
            @RequestParam @Min(1) int threshold,
            @RequestParam(required = false) String notes) {
        try {
            Alert alert = alertService.createAlert(productId, warehouseId, threshold, notes);
            return ResponseEntity.ok(alert);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product or warehouse not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid alert data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAlertStatus(
            @PathVariable String id,
            @RequestParam AlertStatus newStatus,
            @RequestParam(required = false) String notes) {
        try {
            Alert alert = alertService.updateAlertStatus(id, newStatus, notes);
            return ResponseEntity.ok(alert);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Alert not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid status transition");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update alert status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeAlert(@PathVariable String id) {
        try {
            Alert alert = alertService.acknowledgeAlert(id);
            return ResponseEntity.ok(alert);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Alert not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid alert state");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to acknowledge alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable String id) {
        try {
            Alert alert = alertService.updateAlertStatus(id, AlertStatus.RESOLVED, "Resolved by admin");
            return ResponseEntity.ok(alert);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Alert not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid alert state");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to resolve alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

        @PostMapping("/trigger-check")
    public ResponseEntity<?> triggerAlertCheck() {
        try {
    
            alertService.triggerAlertCheck();


            // Get count after triggering
            long count = alertService.getLowStockAlertsCount();


            // Also trigger the immediate check for all products
            alertService.checkLowStockLevelsInternal();


            // Get updated count
            long updatedCount = alertService.getLowStockAlertsCount();


            Map<String, Object> response = new HashMap<>();
            response.put("message", "Alert check triggered successfully");
            response.put("lowStockAlertsCount", updatedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in triggerAlertCheck: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to trigger alert check");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAlerts() {
        try {
            List<Alert> alerts = alertService.getActiveAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve active alerts");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getAlertsByProduct(@PathVariable String productId) {
        try {
            List<Alert> alerts = alertService.getAlertsByProduct(productId);
            return ResponseEntity.ok(alerts);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts by product");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getAlertsByWarehouse(@PathVariable String warehouseId) {
        try {
            List<Alert> alerts = alertService.getAlertsByWarehouse(warehouseId);
            return ResponseEntity.ok(alerts);
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Warehouse not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts by warehouse");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getAlertsByStatus(@PathVariable AlertStatus status) {
        try {
            List<Alert> alerts = alertService.getAlertsByStatus(status);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts by status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/created-after")
    public ResponseEntity<?> getAlertsCreatedAfter(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date) {
        try {
            List<Alert> alerts = alertService.getAlertsCreatedAfter(date);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts created after date");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/below-threshold")
    public ResponseEntity<?> getActiveAlertsBelowThreshold() {
        try {
            List<Alert> alerts = alertService.getActiveAlertsBelowThreshold();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alerts below threshold");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/count/low-stock")
    public ResponseEntity<?> getLowStockAlertsCount() {
        try {
            long count = alertService.getLowStockAlertsCount();
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve low stock alerts count");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/debug/inventory-status")
    public ResponseEntity<?> getInventoryStatus() {
        try {
    
            
            // This will be implemented in AlertService
            Map<String, Object> debugInfo = alertService.getInventoryDebugInfo();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inventory status retrieved");
            response.put("debugInfo", debugInfo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getInventoryStatus: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get inventory status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@PathVariable String id) {
        try {
            alertService.deleteAlert(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Alert not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        } catch (IllegalStateException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot delete alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete alert");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
