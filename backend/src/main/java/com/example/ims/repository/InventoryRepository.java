package com.example.ims.repository;

import com.example.ims.model.Inventory;
import com.example.ims.model.Product;
import com.example.ims.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, String> {
    List<Inventory> findByProduct(Product product);
    List<Inventory> findByWarehouse(Warehouse warehouse);
    Inventory findByProductAndWarehouse(Product product, Warehouse warehouse);
    
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable <= i.product.minimumStockThreshold")
    List<Inventory> findLowStockInventories();
    
    boolean existsByWarehouseWarehouseId(String warehouseId);
    
    List<Inventory> findByWarehouseWarehouseId(String warehouseId);
}
