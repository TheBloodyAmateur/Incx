package com.github.thebloodyamateur.incx.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContentResponse {
    private String name;
    private String type;
    private Long size;
}
