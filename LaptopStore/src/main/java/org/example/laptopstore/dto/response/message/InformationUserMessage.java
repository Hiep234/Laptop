package org.example.laptopstore.dto.response.message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformationUserMessage {
    private Integer idUser;
    private String nameUser;
    private LocalDateTime createdAt;
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InformationUserMessage that = (InformationUserMessage) o;
        return Objects.equals(idUser, that.idUser) && Objects.equals(nameUser, that.nameUser);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUser, nameUser);
    }

}
