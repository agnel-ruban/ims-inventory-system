package com.example.ims.repository;

import com.example.ims.model.SalesOrder;
import com.example.ims.model.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, String> {
    
    List<SalesOrder> findByCustomerEmail(String customerEmail);
    
    List<SalesOrder> findByStatus(SalesOrderStatus status);
    
    List<SalesOrder> findByWarehouseWarehouseId(String warehouseId);
} 