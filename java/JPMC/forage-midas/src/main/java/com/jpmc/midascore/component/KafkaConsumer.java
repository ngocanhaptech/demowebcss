package com.jpmc.midascore.component;

import com.jpmc.midascore.entity.UserRecord;
import com.jpmc.midascore.entity.TransactionRecord;
import com.jpmc.midascore.foundation.Incentive; // Đảm bảo bạn đã tạo DTO này
import com.jpmc.midascore.foundation.Transaction;
import com.jpmc.midascore.repository.UserRepository;
import com.jpmc.midascore.repository.TransactionRepository;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaConsumer {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final IncentiveService incentiveService; // Thêm service này

    public KafkaConsumer(UserRepository userRepository, 
                         TransactionRepository transactionRepository, 
                         IncentiveService incentiveService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.incentiveService = incentiveService;
    }

    @KafkaListener(topics = "${general.kafka-topic}", groupId = "midas-core")
    public void listen(Transaction transaction) {
        UserRecord sender = userRepository.findById(transaction.getSenderId());
        UserRecord recipient = userRepository.findById(transaction.getRecipientId());

        // 1. Logic kiểm tra tính hợp lệ của giao dịch
        if (sender != null && recipient != null && sender.getBalance() >= transaction.getAmount()) {
            
            // 2. Gọi Incentive API thông qua service
            Incentive incentive = incentiveService.getIncentive(transaction);
            float incentiveAmount = (incentive != null) ? incentive.getAmount() : 0f;

            // 3. Cập nhật số dư 
            // Người gửi: Chỉ bị trừ số tiền gốc (amount)
            sender.setBalance(sender.getBalance() - transaction.getAmount());
            
            // Người nhận: Được cộng số tiền gốc + tiền thưởng (incentive)
            recipient.setBalance(recipient.getBalance() + transaction.getAmount() + incentiveAmount);

            // 4. Lưu thay đổi vào Database
            userRepository.save(sender);
            userRepository.save(recipient);

            // 5. Lưu bản ghi giao dịch kèm theo số tiền thưởng
            TransactionRecord record = new TransactionRecord(sender, recipient, transaction.getAmount());
            record.setIncentive(incentiveAmount); // Sử dụng setter bạn vừa thêm ở bước trước
            transactionRepository.save(record);
        }
    }
}