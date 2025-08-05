package com.example.ims.config;

import com.example.ims.model.Role;
import com.example.ims.model.User;
import com.example.ims.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Create or update default admin user
        User adminUser = userRepository.findByUsername("admin").orElse(null);
        
        if (adminUser == null) {
            // Create new admin user
            adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@ims.com");
            adminUser.setFullName("System Administrator");
            adminUser.setRole(Role.ADMIN);
            adminUser.setEnabled(true);
            
        } else {
            // Update existing admin user password

        }
        
        // Set/update password
        adminUser.setPassword(passwordEncoder.encode(adminPassword));
        userRepository.save(adminUser);


    }
}
