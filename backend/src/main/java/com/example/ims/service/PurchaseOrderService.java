package com.example.ims.service;

import com.example.ims.model.*;
import com.example.ims.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Service
public class PurchaseOrderService {
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryService inventoryService;

    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll();
    }

    public PurchaseOrder getPurchaseOrderById(String id) {
        return purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Purchase Order not found with id: " + id));
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(String warehouseId, String supplierName, 
            String contactInfo, String notes, List<CreatePurchaseOrderItemRequest> items) {

        
        // Validate warehouse
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));

        // Create purchase order
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setWarehouse(warehouse);
        purchaseOrder.setSupplierName(supplierName);
        purchaseOrder.setContactInfo(contactInfo);
        purchaseOrder.setNotes(notes);
        purchaseOrder.setStatus(PurchaseOrderStatus.PENDING);

        // Save the purchase order first to get an ID
        purchaseOrder = purchaseOrderRepository.save(purchaseOrder);


        // Validate and add items
        for (CreatePurchaseOrderItemRequest item : items) {
            // Get the product from database using productId
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + item.getProductId()));
            
            // Create a new PurchaseOrderItem with managed entities
            PurchaseOrderItem newItem = new PurchaseOrderItem();
            newItem.setProduct(product);
            newItem.setQuantityOrdered(item.getQuantityOrdered());
            newItem.setUnitPrice(item.getUnitPrice());
            newItem.setQuantityReceived(0); // Start with 0 received
            newItem.setNotes(item.getNotes());
            newItem.setPurchaseOrder(purchaseOrder);
            
            // Save the item
            purchaseOrderItemRepository.save(newItem);

        }


        return purchaseOrder;
    }

    // Temporarily removed to fix compilation issues

    @Transactional
    public PurchaseOrder updateOrderStatus(String id, PurchaseOrderStatus newStatus) {
        PurchaseOrder order = getPurchaseOrderById(id);
        
        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);
        
        order.setStatus(newStatus);
        
        // Handle status-specific actions
        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            receiveOrder(order);
        }
        
        return purchaseOrderRepository.save(order);
    }

    @Transactional
    public PurchaseOrder receiveItems(String orderId, List<PurchaseOrderItem> receivedItems) {
        PurchaseOrder order = getPurchaseOrderById(orderId);
        
        if (order.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new IllegalStateException("Can only receive items for APPROVED orders");
        }

        for (PurchaseOrderItem receivedItem : receivedItems) {
            PurchaseOrderItem orderItem = order.getItems().stream()
                .filter(item -> item.getId().equals(receivedItem.getId()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Order item not found"));

            if (receivedItem.getQuantityReceived() > orderItem.getQuantityOrdered()) {
                throw new IllegalArgumentException("Received quantity cannot exceed ordered quantity");
            }

            orderItem.setQuantityReceived(receivedItem.getQuantityReceived());
            
            // Get current inventory
            Inventory inventory = inventoryService.getInventoryByProduct(orderItem.getProduct().getProductId())
                .stream()
                .filter(inv -> inv.getWarehouse().getWarehouseId().equals(order.getWarehouse().getWarehouseId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No inventory found for this product in the warehouse"));

            // Update inventory with received quantity
            inventoryService.updateStock(
                inventory.getInventoryId(),
                inventory.getQuantityAvailable() + receivedItem.getQuantityReceived(),
                inventory.getQuantityReserved(),
                inventory.getQuantityDamaged()
            );
        }

        // Check if all items are fully received
        boolean allReceived = order.getItems().stream()
            .allMatch(PurchaseOrderItem::isFullyReceived);
        
        if (allReceived) {
            order.setStatus(PurchaseOrderStatus.RECEIVED);
        }

        return purchaseOrderRepository.save(order);
    }

    private void validateStatusTransition(PurchaseOrderStatus currentStatus, PurchaseOrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        switch (currentStatus) {
            case PENDING:
                if (newStatus != PurchaseOrderStatus.APPROVED) {
                    throw new IllegalStateException("PENDING orders can only be moved to APPROVED");
                }
                break;
            case APPROVED:
                if (newStatus != PurchaseOrderStatus.RECEIVED) {
                    throw new IllegalStateException("APPROVED orders can only be moved to RECEIVED");
                }
                break;
            case RECEIVED:
                throw new IllegalStateException("Cannot change status of RECEIVED orders");
        }
    }

    private void receiveOrder(PurchaseOrder order) {

        
        // When order is marked as RECEIVED, update inventory
        for (PurchaseOrderItem item : order.getItems()) {

            
            // Get current inventory for this product in the warehouse
            Inventory inventory = inventoryService.getInventoryByProduct(item.getProduct().getProductId())
                .stream()
                .filter(inv -> inv.getWarehouse().getWarehouseId().equals(order.getWarehouse().getWarehouseId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No inventory found for this product in the warehouse"));

            
            
            // Update inventory: add the ordered quantity to available stock
            inventoryService.updateStock(
                inventory.getInventoryId(),
                inventory.getQuantityAvailable() + item.getQuantityOrdered(),
                inventory.getQuantityReserved(),
                inventory.getQuantityDamaged()
            );

            // Mark item as fully received
            item.setQuantityReceived(item.getQuantityOrdered());

        }
        

    }



    public List<PurchaseOrder> getPurchaseOrdersByStatus(PurchaseOrderStatus status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    public List<PurchaseOrder> getPurchaseOrdersByWarehouse(String warehouseId) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new EntityNotFoundException("Warehouse not found with id: " + warehouseId));
        return purchaseOrderRepository.findByWarehouse(warehouse);
    }

    @Transactional
    public void deletePurchaseOrder(String id) {
        PurchaseOrder order = getPurchaseOrderById(id);
        
        if (order.getStatus() != PurchaseOrderStatus.PENDING) {
            throw new IllegalStateException("Can only delete PENDING orders");
        }
        
        purchaseOrderRepository.delete(order);
    }

    public List<PurchaseOrder> getOrdersInDateRange(Date startDate, Date endDate) {
        return purchaseOrderRepository.findOrdersInDateRange(startDate, endDate);
    }

    /**
     * Auto-approve purchase orders that have been pending for more than 1 minute
     * Runs every 30 seconds to check for orders that need auto-approval
     */
    @Scheduled(fixedRate = 30000) // 30 seconds = 30,000 milliseconds
    @Transactional
    public void autoApprovePurchaseOrders() {

        
        List<PurchaseOrder> pendingOrders = purchaseOrderRepository.findByStatus(PurchaseOrderStatus.PENDING);
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minus(1, ChronoUnit.MINUTES);
        
        for (PurchaseOrder order : pendingOrders) {
            LocalDateTime orderCreatedAt = order.getCreatedAt().toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDateTime();
            
            if (orderCreatedAt.isBefore(oneMinuteAgo)) {

                
                try {
                    updateOrderStatus(order.getPoId(), PurchaseOrderStatus.APPROVED);

                    
                    // Also mark as RECEIVED to update inventory and resolve alerts
                    updateOrderStatus(order.getPoId(), PurchaseOrderStatus.RECEIVED);

                } catch (Exception e) {
                    System.err.println("Failed to auto-approve purchase order: " + order.getPoId() + 
                        " - Error: " + e.getMessage());
                }
            }
        }
        

    }
}
