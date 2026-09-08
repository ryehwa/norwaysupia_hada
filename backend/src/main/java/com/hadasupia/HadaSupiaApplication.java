package com.hadasupia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class HadaSupiaApplication {
    public static void main(String[] args) {
        SpringApplication.run(HadaSupiaApplication.class, args);
    }
}
