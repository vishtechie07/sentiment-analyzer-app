package com.sentiment.analyzer.controller;

import com.sentiment.analyzer.dto.SentimentRequest;
import com.sentiment.analyzer.dto.SentimentResponse;
import com.sentiment.analyzer.service.SentimentAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for sentiment analysis.
 * 
 * Handles HTTP requests for analyzing text and
 * checking if the app is running.
 * 
 * @author Vishnu
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:8080"})
public class SentimentController {

    /** Service that does sentiment analysis */
    private final SentimentAnalysisService sentimentService;

    /**
     * Constructor with dependency injection.
     * 
     * @param sentimentService service for sentiment analysis
     */
    @Autowired
    public SentimentController(SentimentAnalysisService sentimentService) {
        this.sentimentService = sentimentService;
    }

    /**
     * Analyzes text sentiment from POST request.
     * 
     * Takes JSON with text and returns sentiment
     * analysis results.
     * 
     * @param request contains the text to analyze
     * @return sentiment analysis results
     */
    @PostMapping("/analyze")
    public ResponseEntity<SentimentResponse> analyzeSentiment(@RequestBody SentimentRequest request) {
        try {
            // Input validation
            if (request == null || request.getText() == null) {
                return ResponseEntity.badRequest().body(new SentimentResponse(
                    "", "Error", 0.0, 0.0, 0.0, 0.0
                ));
            }
            
            String text = request.getText().trim();
            if (text.isEmpty()) {
                return ResponseEntity.badRequest().body(new SentimentResponse(
                    "", "Error", 0.0, 0.0, 0.0, 0.0
                ));
            }
            
            // Check text length limit (prevent DoS attacks)
            if (text.length() > 10000) {
                return ResponseEntity.badRequest().body(new SentimentResponse(
                    text.substring(0, 100) + "...", "Error: Text too long (max 10,000 characters)", 0.0, 0.0, 0.0, 0.0
                ));
            }
            
            SentimentResponse response = sentimentService.analyzeSentiment(text);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Return error response if something goes wrong
            SentimentResponse errorResponse = new SentimentResponse(
                request != null ? request.getText() : "", 
                "Error", 
                0.0, // confidence
                0.0, // positiveScore
                0.0, // negativeScore
                0.0  // neutralScore
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Health check endpoint.
     * 
     * @return status message
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Sentiment Analyzer App is running!");
    }
}
