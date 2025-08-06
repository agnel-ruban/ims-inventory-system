package com.example.ims.controller;

import com.example.ims.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {
    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<?> getInventoryOverview() {
        try {
            Map<String, Object> overview = dashboardService.getInventoryOverview();
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory overview");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/turnover")
    public ResponseEntity<?> getInventoryTurnover(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        try {
            Map<String, Object> turnover = dashboardService.getInventoryTurnover(startDate, endDate);
            return ResponseEntity.ok(turnover);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid date range");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory turnover");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/reorder-recommendations")
    public ResponseEntity<?> getReorderRecommendations() {
        try {
            List<Map<String, Object>> recommendations = dashboardService.getReorderRecommendations();
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve reorder recommendations");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/warehouse-utilization")
    public ResponseEntity<?> getWarehouseUtilization() {
        try {
            Map<String, Object> utilization = dashboardService.getWarehouseUtilization();
            return ResponseEntity.ok(utilization);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve warehouse utilization");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/alert-metrics")
    public ResponseEntity<?> getAlertMetrics() {
        try {
            Map<String, Object> metrics = dashboardService.getAlertMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve alert metrics");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/inventory-aging")
    public ResponseEntity<?> getInventoryAging() {
        try {
            Map<String, Object> aging = dashboardService.getInventoryAging();
            return ResponseEntity.ok(aging);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve inventory aging");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}