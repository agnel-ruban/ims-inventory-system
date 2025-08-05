package com.example.ims.service;

import com.example.ims.model.Warehouse;
import com.example.ims.model.Inventory;
import com.example.ims.repository.WarehouseRepository;
import com.example.ims.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarehouseService {
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(String id) {
        return warehouseRepository.findById(id).orElse(null);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(String id, Warehouse warehouse) {
        warehouse.setWarehouseId(id);
        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(String id) {
        warehouseRepository.deleteById(id);
    }
    
    public boolean hasProducts(String warehouseId) {
        // Check if there are any inventory records for this warehouse
        // A warehouse has products if it has any inventory records (regardless of stock level)
        return inventoryRepository.existsByWarehouseWarehouseId(warehouseId);
    }
    
    public boolean hasProductsWithStock(String warehouseId) {
        // Check if there are any inventory records for this warehouse with stock > 0
        List<Inventory> inventories = inventoryRepository.findByWarehouseWarehouseId(warehouseId);
        return inventories.stream().anyMatch(inv -> inv.getQuantityAvailable() > 0);
    }
}
