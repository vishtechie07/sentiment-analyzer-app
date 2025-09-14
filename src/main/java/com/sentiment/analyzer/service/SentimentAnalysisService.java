package com.sentiment.analyzer.service;

import com.sentiment.analyzer.dto.SentimentResponse;
import edu.stanford.nlp.pipeline.CoreDocument;
import edu.stanford.nlp.pipeline.CoreSentence;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Properties;

/**
 * Handles sentiment analysis using Stanford CoreNLP.
 * 
 * Takes text and figures out if it's positive, negative,
 * or neutral. Returns scores and overall sentiment.
 * 
 * @author Vishnu
 */
@Service
public class SentimentAnalysisService {

    /** The CoreNLP pipeline */
    private StanfordCoreNLP pipeline;

    /**
     * Sets up the pipeline when Spring creates this bean.
     * 
     * Configures these annotators:
     * - tokenize: splits text into words
     * - ssplit: splits into sentences  
     * - pos: parts of speech
     * - parse: syntax trees
     * - lemma: word roots
     * - sentiment: emotional tone
     */
    @PostConstruct
    public void init() {
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,parse,lemma,sentiment");
        props.setProperty("corenlp.server", "false");
        
        this.pipeline = new StanfordCoreNLP(props);
    }

    /**
     * Analyzes the sentiment of the given text.
     * 
     * @param text the text to analyze
     * @return sentiment analysis results
     * @throws IllegalArgumentException if text is invalid
     */
    public SentimentResponse analyzeSentiment(String text) {
        // Enhanced input validation and sanitization
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be null or empty");
        }
        
        // Remove leading/trailing whitespace
        text = text.trim();
        
        // Check for reasonable length (prevent DoS attacks)
        if (text.length() > 10000) {
            throw new IllegalArgumentException("Text too long. Maximum length is 10,000 characters");
        }
        
        // Check for minimum length
        if (text.length() < 1) {
            throw new IllegalArgumentException("Text must contain at least 1 character");
        }
        
        // Basic content validation - check for suspicious patterns
        if (containsSuspiciousContent(text)) {
            throw new IllegalArgumentException("Text contains suspicious content");
        }
        
        // Process with CoreNLP
        CoreDocument document = new CoreDocument(text);
        pipeline.annotate(document);

        // Keep track of scores
        double positiveScore = 0.0;
        double negativeScore = 0.0;
        double neutralScore = 0.0;
        int sentenceCount = 0;

        // Go through each sentence
        for (CoreSentence sentence : document.sentences()) {
            String sentiment = sentence.sentiment();
            sentenceCount++;
            
            // Add scores based on sentiment
            switch (sentiment.toLowerCase()) {
                case "very positive":
                    positiveScore += 2.0;
                    break;
                case "positive":
                    positiveScore += 1.0;
                    break;
                case "neutral":
                    neutralScore += 1.0;
                    break;
                case "negative":
                    negativeScore += 1.0;
                    break;
                case "very negative":
                    negativeScore += 1.0;
                    break;
            }
        }

        // Get average scores
        if (sentenceCount > 0) {
            positiveScore /= sentenceCount;
            negativeScore /= sentenceCount;
            neutralScore /= sentenceCount;
        }

        // Figure out overall sentiment
        String overallSentiment;
        double confidence;

        if (positiveScore > negativeScore && positiveScore > neutralScore) {
            overallSentiment = "Positive";
            confidence = positiveScore;
        } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
            overallSentiment = "Negative";
            confidence = negativeScore;
        } else {
            overallSentiment = "Neutral";
            confidence = neutralScore;
        }

        return new SentimentResponse(text, overallSentiment, confidence, positiveScore, negativeScore, neutralScore);
    }
    
    /**
     * Checks if text contains suspicious or potentially malicious content.
     * 
     * @param text the text to check
     * @return true if suspicious content is found
     */
    private boolean containsSuspiciousContent(String text) {
        if (text == null) return false;
        
        String lowerText = text.toLowerCase();
        
        // Check for potential script injection attempts
        if (lowerText.contains("<script") || 
            lowerText.contains("javascript:") || 
            lowerText.contains("onload=") ||
            lowerText.contains("onerror=") ||
            lowerText.contains("onclick=")) {
            return true;
        }
        
        // Check for SQL injection patterns
        if (lowerText.contains("' or '1'='1") || 
            lowerText.contains("; drop table") ||
            lowerText.contains("union select")) {
            return true;
        }
        
        // Check for excessive special characters (potential encoding attacks)
        long specialCharCount = text.chars()
            .filter(ch -> !Character.isLetterOrDigit(ch) && !Character.isWhitespace(ch))
            .count();
        
        if (specialCharCount > text.length() * 0.3) { // More than 30% special chars
            return true;
        }
        
        return false;
    }
}
