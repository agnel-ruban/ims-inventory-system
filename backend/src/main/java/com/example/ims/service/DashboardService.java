package com.example.ims.service;

import com.example.ims.model.*;
import com.example.ims.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private AlertRepository alertRepository;

    public Map<String, Object> getInventoryOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Total number of products
        long totalProducts = productRepository.count();
        
        // Total stock value
        double totalValue = inventoryRepository.findAll().stream()
            .mapToDouble(inv -> inv.getQuantityAvailable() * inv.getProduct().getUnitPrice())
            .sum();
        
        // Low stock items count
        long lowStockCount = inventoryRepository.findLowStockInventories().size();
        
        // Out of stock items count
        long outOfStockCount = inventoryRepository.findAll().stream()
            .filter(inv -> inv.getQuantityAvailable() == 0)
            .count();

        overview.put("totalProducts", totalProducts);
        overview.put("totalStockValue", totalValue);
        overview.put("lowStockItemsCount", lowStockCount);
        overview.put("outOfStockItemsCount", outOfStockCount);
        
        return overview;
    }

    public Map<String, Object> getInventoryTurnover(Date startDate, Date endDate) {
        Map<String, Object> turnover = new HashMap<>();
        
        // Get all completed purchase orders in date range
        List<PurchaseOrder> completedOrders = purchaseOrderRepository
            .findByStatusAndCreatedAfter(PurchaseOrderStatus.RECEIVED, startDate);
        
        // Calculate total items received
        int totalReceived = completedOrders.stream()
            .flatMap(po -> po.getItems().stream())
            .mapToInt(PurchaseOrderItem::getQuantityReceived)
            .sum();
        
        // Calculate average inventory level
        double avgInventoryLevel = inventoryRepository.findAll().stream()
            .mapToInt(Inventory::getQuantityAvailable)
            .average()
            .orElse(0.0);
        
        // Calculate turnover ratio
        double turnoverRatio = avgInventoryLevel > 0 ? totalReceived / avgInventoryLevel : 0;
        
        turnover.put("totalReceived", totalReceived);
        turnover.put("averageInventoryLevel", avgInventoryLevel);
        turnover.put("turnoverRatio", turnoverRatio);
        
        return turnover;
    }

    public List<Map<String, Object>> getReorderRecommendations() {
        List<Map<String, Object>> recommendations = new ArrayList<>();
        
        // Get all low stock inventories
        List<Inventory> lowStockItems = inventoryRepository.findLowStockInventories();
        
        for (Inventory inv : lowStockItems) {
            Map<String, Object> recommendation = new HashMap<>();
            Product product = inv.getProduct();
            
            // Calculate recommended order quantity
            int currentStock = inv.getQuantityAvailable();
            int threshold = product.getMinimumStockThreshold();
            int recommendedQuantity = threshold * 2 - currentStock; // Order up to 2x threshold
            
            recommendation.put("productId", product.getProductId());
            recommendation.put("productName", product.getName());
            recommendation.put("currentStock", currentStock);
            recommendation.put("threshold", threshold);
            recommendation.put("recommendedOrderQuantity", recommendedQuantity);
            recommendation.put("estimatedCost", recommendedQuantity * product.getUnitPrice());
            
            recommendations.add(recommendation);
        }
        
        return recommendations;
    }

    public Map<String, Object> getWarehouseUtilization() {
        Map<String, Object> utilization = new HashMap<>();
        List<Map<String, Object>> warehouseStats = new ArrayList<>();
        
        List<Warehouse> warehouses = warehouseRepository.findAll();
        for (Warehouse warehouse : warehouses) {
            Map<String, Object> stats = new HashMap<>();
            List<Inventory> warehouseInventory = inventoryRepository.findByWarehouse(warehouse);
            
            // Calculate warehouse statistics
            long totalProducts = warehouseInventory.size();
            long lowStockItems = warehouseInventory.stream()
                .filter(inv -> inv.getQuantityAvailable() <= inv.getProduct().getMinimumStockThreshold())
                .count();
            double totalValue = warehouseInventory.stream()
                .mapToDouble(inv -> inv.getQuantityAvailable() * inv.getProduct().getUnitPrice())
                .sum();
            
            stats.put("warehouseId", warehouse.getWarehouseId());
            stats.put("warehouseName", warehouse.getName());
            stats.put("totalProducts", totalProducts);
            stats.put("lowStockItems", lowStockItems);
            stats.put("totalValue", totalValue);
            
            warehouseStats.add(stats);
        }
        
        utilization.put("warehouseStats", warehouseStats);
        return utilization;
    }

    public Map<String, Object> getAlertMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Get counts by status
        Map<AlertStatus, Long> statusCounts = alertRepository.findAll().stream()
            .collect(Collectors.groupingBy(Alert::getStatus, Collectors.counting()));
        
        // Get most frequent alert products
        List<Map<String, Object>> frequentAlerts = alertRepository.findAll().stream()
            .collect(Collectors.groupingBy(Alert::getProduct))
            .entrySet().stream()
            .map(entry -> {
                Map<String, Object> alert = new HashMap<>();
                alert.put("productId", entry.getKey().getProductId());
                alert.put("productName", entry.getKey().getName());
                alert.put("alertCount", entry.getValue().size());
                return alert;
            })
            .sorted((a, b) -> ((Long) b.get("alertCount")).compareTo((Long) a.get("alertCount")))
            .limit(5)
            .collect(Collectors.toList());
        
        metrics.put("statusCounts", statusCounts);
        metrics.put("frequentAlerts", frequentAlerts);
        
        return metrics;
    }

    public Map<String, Object> getInventoryAging() {
        Map<String, Object> aging = new HashMap<>();
        List<Map<String, Object>> agingProducts = new ArrayList<>();
        
        // Get all inventory items
        List<Inventory> inventories = inventoryRepository.findAll();
        
        for (Inventory inv : inventories) {
            if (inv.getQuantityAvailable() > 0) {
                Map<String, Object> product = new HashMap<>();
                product.put("productId", inv.getProduct().getProductId());
                product.put("productName", inv.getProduct().getName());
                product.put("quantity", inv.getQuantityAvailable());
                product.put("value", inv.getQuantityAvailable() * inv.getProduct().getUnitPrice());
                product.put("lastUpdated", inv.getLastUpdated());
                
                agingProducts.add(product);
            }
        }
        
        // Sort by last updated date (oldest first)
        agingProducts.sort((a, b) -> ((Date) a.get("lastUpdated")).compareTo((Date) b.get("lastUpdated")));
        
        aging.put("agingProducts", agingProducts);
        return aging;
    }
}