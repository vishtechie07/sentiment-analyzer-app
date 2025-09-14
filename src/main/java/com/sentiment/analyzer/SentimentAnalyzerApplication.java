package com.sentiment.analyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main app class for sentiment analysis.
 * 
 * Spring Boot app that uses Stanford CoreNLP to analyze
 * text sentiment.
 * 
 * @author Vishnu
 */
@SpringBootApplication
public class SentimentAnalyzerApplication {

    /**
     * Starts the app.
     * 
     * @param args command line args
     */
    public static void main(String[] args) {
        SpringApplication.run(SentimentAnalyzerApplication.class, args);
    }
}
