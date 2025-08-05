package com.example.ims.config;

import com.example.ims.model.Warehouse;
import com.example.ims.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class WarehouseDataInitializer implements CommandLineRunner {
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no warehouses exist
        if (warehouseRepository.count() == 0) {
            initializeWarehouses();
        }
    }
    
    private void initializeWarehouses() {
        List<Warehouse> warehouses = Arrays.asList(
            createWarehouse("Mumbai Central Warehouse", "Mumbai, Maharashtra", 
                "Contact: +91-22-12345678\nEmail: mumbai@ims.com\nAddress: Andheri East, Mumbai"),
            createWarehouse("Chennai Distribution Center", "Chennai, Tamil Nadu", 
                "Contact: +91-44-87654321\nEmail: chennai@ims.com\nAddress: T Nagar, Chennai"),
            createWarehouse("Pune Storage Facility", "Pune, Maharashtra", 
                "Contact: +91-20-11223344\nEmail: pune@ims.com\nAddress: Hinjewadi, Pune"),
            createWarehouse("Delhi North Warehouse", "Delhi, NCR", 
                "Contact: +91-11-55667788\nEmail: delhi@ims.com\nAddress: Gurgaon, Haryana"),
            createWarehouse("Bangalore Tech Hub", "Bangalore, Karnataka", 
                "Contact: +91-80-99887766\nEmail: bangalore@ims.com\nAddress: Electronic City, Bangalore"),
            createWarehouse("Hyderabad South Center", "Hyderabad, Telangana", 
                "Contact: +91-40-44332211\nEmail: hyderabad@ims.com\nAddress: Hitech City, Hyderabad"),
            createWarehouse("Kolkata East Facility", "Kolkata, West Bengal", 
                "Contact: +91-33-77889900\nEmail: kolkata@ims.com\nAddress: Salt Lake, Kolkata"),
            createWarehouse("Ahmedabad Industrial", "Ahmedabad, Gujarat", 
                "Contact: +91-79-66554433\nEmail: ahmedabad@ims.com\nAddress: Vastrapur, Ahmedabad")
        );
        
        warehouseRepository.saveAll(warehouses);

    }
    
    private Warehouse createWarehouse(String name, String location, String contactDetails) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(name);
        warehouse.setLocation(location);
        warehouse.setContactDetails(contactDetails);
        return warehouse;
    }
} 