package com.jpmc.midascore;

import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9092", "port=9092"})
public class TaskFourTests {
    static final Logger logger = LoggerFactory.getLogger(TaskFourTests.class);

    @Autowired
    private KafkaProducer kafkaProducer;

    @Autowired
    private UserPopulator userPopulator;

    @Autowired
    private FileLoader fileLoader;

    @Autowired
    private com.jpmc.midascore.repository.UserRepository userRepository;

    @Test
    void task_four_verifier() throws InterruptedException {
        userPopulator.populate();
        String[] transactionLines = fileLoader.loadStrings("/test_data/alskdjfh.fhdjsk");
        for (String transactionLine : transactionLines) {
            kafkaProducer.send(transactionLine);
        }
        
        // 1. Chờ để Kafka và Incentive API xử lý
        Thread.sleep(5000);

        // 2. Lấy Wilbur và in kết quả TRƯỚC khi vào vòng lặp vô hạn
        com.jpmc.midascore.entity.UserRecord wilbur = userRepository.findByName("wilbur");
        if (wilbur != null) {
            System.out.println("RESULT_WILBUR_BALANCE: " + (int)Math.floor(wilbur.getBalance()));
        }

        // 3. Vòng lặp giữ cho test không tắt (đây là lý do gây lỗi unreachable nếu code nằm dưới nó)
        logger.info("----------------------------------------------------------");
        logger.info("use your debugger to find out what wilbur's balance is");
        while (true) {
            Thread.sleep(20000);
            logger.info("...");
        }
    }
}
