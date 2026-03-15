package com.wellsfargo.counselor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long clientId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String address;
    private String phone;
    
    @Column(nullable = false, unique = true)
    private String email;

    // QUAN TRỌNG: Thiết lập mối quan hệ với Advisor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advisor_id", nullable = false)
    private Advisor advisor;

    // Quan hệ với Portfolio (1 Client - 1 Portfolio)
    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL)
    private Portfolio portfolio;
}