package com.example.ims.repository;

import com.example.ims.model.Alert;
import com.example.ims.model.AlertStatus;
import com.example.ims.model.Product;
import com.example.ims.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findByStatus(AlertStatus status);
    List<Alert> findByProduct(Product product);
    List<Alert> findByWarehouse(Warehouse warehouse);
    Alert findByProductAndWarehouseAndStatus(Product product, Warehouse warehouse, AlertStatus status);
    List<Alert> findByProductAndWarehouseAndStatusIn(Product product, Warehouse warehouse, List<AlertStatus> statuses);
    
    @Query("SELECT a FROM Alert a WHERE a.createdAt >= ?1")
    List<Alert> findAlertsCreatedAfter(Date date);
    
    @Query("SELECT a FROM Alert a WHERE a.status = ?1 AND a.currentStock <= a.threshold ORDER BY a.createdAt DESC")
    List<Alert> findActiveAlertsBelowThreshold(AlertStatus status);
    
    long countByStatus(AlertStatus status);
}
