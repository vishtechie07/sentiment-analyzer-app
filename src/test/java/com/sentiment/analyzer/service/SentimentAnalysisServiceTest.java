package com.sentiment.analyzer.service;

import com.sentiment.analyzer.dto.SentimentResponse;
import com.sentiment.analyzer.service.SentimentAnalysisService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "logging.level.com.sentiment.analyzer=INFO"
})
public class SentimentAnalysisServiceTest {

    @Test
    public void testEmptyText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        
        // Test that empty text throws exception (security enhancement)
        assertThrows(IllegalArgumentException.class, () -> {
            service.analyzeSentiment("");
        });
    }

    @Test
    public void testNullText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        
        // Test that null text throws exception (security enhancement)
        assertThrows(IllegalArgumentException.class, () -> {
            service.analyzeSentiment(null);
        });
    }

    @Test
    public void testPositiveText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        SentimentResponse response = service.analyzeSentiment("I love this application! It's amazing and wonderful.");
        
        assertNotNull(response);
        assertNotNull(response.getSentiment());
        assertTrue(response.getConfidence() >= 0.0);
        assertEquals("I love this application! It's amazing and wonderful.", response.getText());
        assertTrue(response.getPositiveScore() > 0.0);
    }

    @Test
    public void testNegativeText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        SentimentResponse response = service.analyzeSentiment("I hate this. It's terrible and awful.");
        
        assertNotNull(response);
        assertNotNull(response.getSentiment());
        assertTrue(response.getConfidence() >= 0.0);
        assertEquals("I hate this. It's terrible and awful.", response.getText());
        assertTrue(response.getNegativeScore() > 0.0);
    }

    @Test
    public void testNeutralText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        SentimentResponse response = service.analyzeSentiment("The weather is cloudy today.");
        
        assertNotNull(response);
        assertNotNull(response.getSentiment());
        assertTrue(response.getConfidence() >= 0.0);
        assertEquals("The weather is cloudy today.", response.getText());
    }
    
    @Test
    public void testSuspiciousContent() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        
        // Test that suspicious content throws exception (security enhancement)
        assertThrows(IllegalArgumentException.class, () -> {
            service.analyzeSentiment("<script>alert('xss')</script>");
        });
    }
    
    @Test
    public void testLongText() {
        SentimentAnalysisService service = new SentimentAnalysisService();
        
        // Create text longer than 10,000 characters
        StringBuilder longText = new StringBuilder();
        for (int i = 0; i < 10001; i++) {
            longText.append("a");
        }
        
        // Test that very long text throws exception (security enhancement)
        assertThrows(IllegalArgumentException.class, () -> {
            service.analyzeSentiment(longText.toString());
        });
    }
}
