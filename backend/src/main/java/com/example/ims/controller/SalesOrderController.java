package com.example.ims.controller;

import com.example.ims.model.SalesOrder;
import com.example.ims.model.SalesOrderStatus;
import com.example.ims.service.SalesOrderService;
import com.example.ims.service.InventoryService;
import com.example.ims.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    @Autowired
    private SalesOrderService salesOrderService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AlertService alertService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalesOrder>> getAllSalesOrders() {
        List<SalesOrder> orders = salesOrderService.getAllSalesOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrder> getSalesOrderById(@PathVariable String id) {
        SalesOrder order = salesOrderService.getSalesOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SalesOrder> createSalesOrder(@RequestBody Map<String, Object> request) {
        try {
            
            
            String warehouseId = (String) request.get("warehouseId");
            String customerName = (String) request.get("customerName");
            String customerEmail = (String) request.get("customerEmail");
            String shippingAddress = (String) request.get("shippingAddress");
            String billingAddress = (String) request.get("billingAddress");
            String notes = (String) request.get("notes");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");
            

            
            SalesOrder order = salesOrderService.createSalesOrder(
                warehouseId, customerName, customerEmail, 
                shippingAddress, billingAddress, notes, itemsData
            );
            

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            System.err.println("=== ERROR CREATING SALES ORDER ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesOrder> updateOrderStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        try {
            
            
            String newStatus = request.get("status");
            SalesOrderStatus status = SalesOrderStatus.valueOf(newStatus.toUpperCase());
            

            
            SalesOrder updatedOrder = salesOrderService.updateOrderStatus(id, status);
            
            // If order is confirmed, decrease stock and check for alerts
            if (status == SalesOrderStatus.CONFIRMED) {
    
                salesOrderService.processConfirmedOrder(updatedOrder);
                
                // Check for low stock alerts after stock decrease
                for (var item : updatedOrder.getItems()) {
                    alertService.checkAndCreateAlertForProduct(
                        item.getProduct().getProductId(), 
                        updatedOrder.getWarehouse().getWarehouseId()
                    );
                }
    
            }
            

            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            System.err.println("=== ERROR UPDATING ORDER STATUS ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSalesOrder(@PathVariable String id) {
        salesOrderService.deleteSalesOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/customer/{customerEmail}")
    public ResponseEntity<List<SalesOrder>> getSalesOrdersByCustomer(@PathVariable String customerEmail) {
        List<SalesOrder> orders = salesOrderService.getSalesOrdersByCustomer(customerEmail);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SalesOrder>> getSalesOrdersByStatus(@PathVariable String status) {
        SalesOrderStatus orderStatus = SalesOrderStatus.valueOf(status.toUpperCase());
        List<SalesOrder> orders = salesOrderService.getSalesOrdersByStatus(orderStatus);
        return ResponseEntity.ok(orders);
    }
} 