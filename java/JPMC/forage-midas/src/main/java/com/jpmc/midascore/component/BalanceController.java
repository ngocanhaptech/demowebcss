package com.jpmc.midascore.component;

import com.jpmc.midascore.entity.UserRecord;
import com.jpmc.midascore.foundation.Balance;
import com.jpmc.midascore.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BalanceController {
    private final UserRepository userRepository;

    public BalanceController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/balance")
    public Balance getBalance(@RequestParam Long userId) {
        // Tìm user trong database bằng ID
        UserRecord user = userRepository.findById(userId.longValue());

        if (user != null) {
            // Trả về Balance với số dư thực tế
            return new Balance(user.getBalance());
        } else {
            // Trả về Balance với số dư là 0 nếu không tìm thấy user
            return new Balance(0f);
        }
    }
}