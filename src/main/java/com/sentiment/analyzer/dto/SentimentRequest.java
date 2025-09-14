package com.sentiment.analyzer.dto;

/**
 * Request object for sentiment analysis.
 * 
 * Just holds the text that needs to be analyzed.
 * 
 * @author Vishnu
 */
public class SentimentRequest {
    
    /** Text to analyze */
    private String text;

    /**
     * Default constructor.
     */
    public SentimentRequest() {}

    /**
     * Constructor with text.
     * 
     * @param text the text to analyze
     */
    public SentimentRequest(String text) {
        this.text = text;
    }

    /**
     * Gets the text.
     * 
     * @return the text
     */
    public String getText() {
        return text;
    }

    /**
     * Sets the text.
     * 
     * @param text the text to set
     */
    public void setText(String text) {
        this.text = text;
    }
}
