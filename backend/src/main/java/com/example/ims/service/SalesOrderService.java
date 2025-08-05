package com.example.ims.service;

import com.example.ims.model.*;
import com.example.ims.repository.SalesOrderRepository;
import com.example.ims.repository.WarehouseRepository;
import com.example.ims.repository.ProductRepository;
import com.example.ims.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SalesOrderService {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    public SalesOrder getSalesOrderById(String id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found"));
    }

    @Transactional
    public SalesOrder createSalesOrder(String warehouseId, String customerName, String customerEmail,
                                     String shippingAddress, String billingAddress, String notes,
                                     List<Map<String, Object>> itemsData) {
        
        // Validate warehouse exists
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        // Create sales order
        SalesOrder salesOrder = new SalesOrder();
        salesOrder.setCustomerName(customerName);
        salesOrder.setCustomerEmail(customerEmail);
        salesOrder.setShippingAddress(shippingAddress);
        salesOrder.setBillingAddress(billingAddress);
        salesOrder.setNotes(notes);
        salesOrder.setStatus(SalesOrderStatus.PENDING);
        salesOrder.setWarehouse(warehouse);

        // Create order items
        for (Map<String, Object> itemData : itemsData) {

            
            String productId = (String) itemData.get("productId");
            Object quantityObj = itemData.get("quantity");
            Object unitPriceObj = itemData.get("unitPrice");
            String itemNotes = (String) itemData.get("notes");
            
            // Handle number type conversion
            Integer quantity;
            Double unitPrice;
            
            if (quantityObj instanceof Number) {
                quantity = ((Number) quantityObj).intValue();
            } else {
                quantity = Integer.valueOf(quantityObj.toString());
            }
            
            if (unitPriceObj instanceof Number) {
                unitPrice = ((Number) unitPriceObj).doubleValue();
            } else {
                unitPrice = Double.valueOf(unitPriceObj.toString());
            }
            


            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            // Check stock availability
            Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse);
            if (inventory == null) {
                throw new RuntimeException("Inventory not found for product: " + productId);
            }

            if (inventory.getQuantityAvailable() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setNotes(itemNotes);
            item.setSalesOrder(salesOrder);

            salesOrder.addItem(item);
        }

        return salesOrderRepository.save(salesOrder);
    }

    @Transactional
    public SalesOrder updateOrderStatus(String orderId, SalesOrderStatus newStatus) {
        SalesOrder order = getSalesOrderById(orderId);
        
        // Validate status transition
        if (order.getStatus() == SalesOrderStatus.CONFIRMED && newStatus == SalesOrderStatus.PENDING) {
            throw new RuntimeException("Cannot change confirmed order back to pending");
        }
        
        order.setStatus(newStatus);
        return salesOrderRepository.save(order);
    }

    @Transactional
    public void processConfirmedOrder(SalesOrder order) {

        
        if (order.getStatus() != SalesOrderStatus.CONFIRMED) {
            throw new RuntimeException("Order must be confirmed to process");
        }

        // Decrease stock for each item
        for (SalesOrderItem item : order.getItems()) {

            
            Inventory inventory = inventoryRepository.findByProductAndWarehouse(
                    item.getProduct(), order.getWarehouse());
            
            if (inventory == null) {
                System.err.println("Inventory not found for product: " + item.getProduct().getName() + " in warehouse: " + order.getWarehouse().getName());
                throw new RuntimeException("Inventory not found");
            }

            

            // Reserve the stock (decrease available quantity)
            inventoryService.reserveStock(inventory.getInventoryId(), item.getQuantity());
            

        }
        

    }

    public void deleteSalesOrder(String id) {
        SalesOrder order = getSalesOrderById(id);
        salesOrderRepository.delete(order);
    }

    public List<SalesOrder> getSalesOrdersByCustomer(String customerEmail) {
        return salesOrderRepository.findByCustomerEmail(customerEmail);
    }

    public List<SalesOrder> getSalesOrdersByStatus(SalesOrderStatus status) {
        return salesOrderRepository.findByStatus(status);
    }
} 