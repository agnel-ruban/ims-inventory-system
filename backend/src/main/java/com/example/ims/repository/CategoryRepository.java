package com.example.ims.repository;

import com.example.ims.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    
    Optional<Category> findByName(String name);
    
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    boolean existsByName(String name);
    
    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.displayOrder ASC")
    List<Category> findAllActiveCategories();
} 