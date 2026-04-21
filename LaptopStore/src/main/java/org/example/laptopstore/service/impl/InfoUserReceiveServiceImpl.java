package org.example.laptopstore.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.laptopstore.entity.InfoUserReceive;
import org.example.laptopstore.repository.InfoUserReceiveRepository;
import org.example.laptopstore.service.InfoUserReceiveService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InfoUserReceiveServiceImpl implements InfoUserReceiveService {
    private final InfoUserReceiveRepository repo;
    @Override
    public InfoUserReceive save(InfoUserReceive infoUserReceive) {
        return repo.save(infoUserReceive);
    }
}
