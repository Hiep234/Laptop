package org.example.laptopstore.dto.response;


import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
public class PageResponse <T>{
    // Getter & Setter
    private List<T> content;       // Dữ liệu của trang hiện tại
    private int totalPages;        // Tổng số trang
    private long totalElements;    // Tổng số bản ghi
    private int pageSize;          // Kích thước mỗi trang
    private int currentPage;       // Trang hiện tại

    public PageResponse() {
    }

    public PageResponse(Page<T> page) {
        this.content = page.getContent();
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.pageSize = page.getSize();
        this.currentPage = page.getNumber()+1;
    }
}
