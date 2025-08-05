package com.example.ims.repository;

import com.example.ims.model.PurchaseOrder;
import com.example.ims.model.PurchaseOrderStatus;
import com.example.ims.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {
    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);
    List<PurchaseOrder> findByWarehouse(Warehouse warehouse);
    List<PurchaseOrder> findByStatusAndWarehouse(PurchaseOrderStatus status, Warehouse warehouse);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.createdAt >= ?1 AND po.createdAt <= ?2")
    List<PurchaseOrder> findOrdersInDateRange(Date startDate, Date endDate);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.status = ?1 AND po.createdAt >= ?2")
    List<PurchaseOrder> findByStatusAndCreatedAfter(PurchaseOrderStatus status, Date date);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.createdAt BETWEEN ?1 AND ?2")
    List<PurchaseOrder> findByCreatedAtBetween(Date startDate, Date endDate);
}
