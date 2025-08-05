package com.example.ims.repository;

import com.example.ims.model.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    // You can add custom query methods here if needed
}
