package com.sentiment.analyzer.dto;

/**
 * Response object for sentiment analysis.
 * 
 * Contains the analyzed text, overall sentiment, confidence,
 * and individual scores for positive, negative, and neutral.
 * 
 * @author Vishnu
 */
public class SentimentResponse {
    
    /** The text that was analyzed */
    private String text;
    
    /** Overall sentiment (Positive, Negative, Neutral) */
    private String sentiment;
    
    /** How confident we are in the result (0.0 to 1.0) */
    private double confidence;
    
    /** Positive sentiment score (0.0 to 1.0) */
    private double positiveScore;
    
    /** Negative sentiment score (0.0 to 1.0) */
    private double negativeScore;
    
    /** Neutral sentiment score (0.0 to 1.0) */
    private double neutralScore;

    /**
     * Default constructor.
     */
    public SentimentResponse() {}

    /**
     * Constructor with all fields.
     * 
     * @param text the analyzed text
     * @param sentiment the overall sentiment
     * @param confidence the confidence score
     * @param positiveScore the positive score
     * @param negativeScore the negative score
     * @param neutralScore the neutral score
     */
    public SentimentResponse(String text, String sentiment, double confidence, double positiveScore, double negativeScore, double neutralScore) {
        this.text = text;
        this.sentiment = sentiment;
        this.confidence = confidence;
        this.positiveScore = positiveScore;
        this.negativeScore = negativeScore;
        this.neutralScore = neutralScore;
    }

    // Getters and setters
    /**
     * Gets the analyzed text.
     * 
     * @return the text
     */
    public String getText() {
        return text;
    }

    /**
     * Sets the analyzed text.
     * 
     * @param text the text to set
     */
    public void setText(String text) {
        this.text = text;
    }

    /**
     * Gets the overall sentiment.
     * 
     * @return the sentiment
     */
    public String getSentiment() {
        return sentiment;
    }

    /**
     * Sets the overall sentiment.
     * 
     * @param sentiment the sentiment to set
     */
    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    /**
     * Gets the confidence score.
     * 
     * @return the confidence score
     */
    public double getConfidence() {
        return confidence;
    }

    /**
     * Sets the confidence score.
     * 
     * @param confidence the confidence score to set
     */
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    /**
     * Gets the positive sentiment score.
     * 
     * @return the positive score
     */
    public double getPositiveScore() {
        return positiveScore;
    }

    /**
     * Sets the positive sentiment score.
     * 
     * @param positiveScore the positive score to set
     */
    public void setPositiveScore(double positiveScore) {
        this.positiveScore = positiveScore;
    }

    /**
     * Gets the negative sentiment score.
     * 
     * @return the negative score
     */
    public double getNegativeScore() {
        return negativeScore;
    }

    /**
     * Sets the negative sentiment score.
     * 
     * @param negativeScore the negative score to set
     */
    public void setNegativeScore(double negativeScore) {
        this.negativeScore = negativeScore;
    }

    /**
     * Gets the neutral sentiment score.
     * 
     * @return the neutral score
     */
    public double getNeutralScore() {
        return neutralScore;
    }

    /**
     * Sets the neutral sentiment score.
     * 
     * @param neutralScore the neutral score to set
     */
    public void setNeutralScore(double neutralScore) {
        this.neutralScore = neutralScore;
    }
}
