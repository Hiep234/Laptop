package org.example.laptopstore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "info_user_receives")
public class InfoUserReceive {
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 50)
    @Column(name = "street_number", length = 100, nullable = false)
    @NotNull
    private String detailAddress;

    @Column(name = "full_name", length = 100, nullable = false)
    @NotNull
    private String fullName;

    @Column(name = "phone_number", length = 15, nullable = false)
    @NotNull
    private String phoneNumber;

    @Column(name = "email", nullable = false)
    @NotNull
    private String email;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ward_id")
    @NotNull
    private Ward ward;

}