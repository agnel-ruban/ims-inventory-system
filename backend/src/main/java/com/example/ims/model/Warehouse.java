package com.example.ims.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "warehouses")
public class Warehouse {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String warehouseId;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @Column(columnDefinition = "TEXT")
    private String contactDetails;

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("warehouse")
    private List<Inventory> inventories = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"warehouse", "items", "hibernateLazyInitializer"})
    private List<SalesOrder> salesOrders = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"warehouse", "items", "hibernateLazyInitializer"})
    private List<PurchaseOrder> purchaseOrders = new ArrayList<>();

    // Helper method to add inventory
    public void addInventory(Inventory inventory) {
        inventories.add(inventory);
        inventory.setWarehouse(this);
    }

    // Helper method to remove inventory
    public void removeInventory(Inventory inventory) {
        inventories.remove(inventory);
        inventory.setWarehouse(null);
    }

    // Helper method to add purchase order
    public void addPurchaseOrder(PurchaseOrder purchaseOrder) {
        purchaseOrders.add(purchaseOrder);
        purchaseOrder.setWarehouse(this);
    }

    // Helper method to remove purchase order
    public void removePurchaseOrder(PurchaseOrder purchaseOrder) {
        purchaseOrders.remove(purchaseOrder);
        purchaseOrder.setWarehouse(null);
    }

    // Helper method to add sales order
    public void addSalesOrder(SalesOrder salesOrder) {
        salesOrders.add(salesOrder);
        salesOrder.setWarehouse(this);
    }

    // Helper method to remove sales order
    public void removeSalesOrder(SalesOrder salesOrder) {
        salesOrders.remove(salesOrder);
        salesOrder.setWarehouse(null);
    }
}
