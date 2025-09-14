# Sentiment Analyzer App

A web app that analyzes the emotional tone of text using natural language processing. Built with Spring Boot and Stanford CoreNLP, it gives you real-time sentiment analysis with detailed scoring and keeps track of your analysis history.

## What This App Does

Ever wondered if your text sounds positive, negative, or neutral? This app helps you figure that out. It's useful for:
- Analyzing customer feedback
- Checking social media posts
- Reviewing your own writing
- Understanding how your messages might be perceived

The app breaks down text sentence by sentence and gives you scores for positive, negative, and neutral tones, plus an overall sentiment with confidence level.

## Features

- **Real-time Analysis**: Get results instantly as you type
- **Detailed Scoring**: See individual scores for positive, negative, and neutral
- **Confidence Metrics**: Know how certain the analysis is
- **History Tracking**: Keep track of all your analyses with timestamps
- **Local Storage**: Your data stays on your device
- **Clean Interface**: Works great on desktop and mobile
- **REST API**: Easy to integrate with other apps

## Tech Stack

### Backend
- **Java 17**: Modern Java with good performance
- **Spring Boot 3.2.0**: Fast development framework
- **Stanford CoreNLP**: Industry-standard NLP library
- **Maven**: Build and dependency management

### Frontend
- **Vanilla JavaScript**: Modern ES6+ features, no framework bloat
- **Tailwind CSS**: Utility-first CSS for quick development
- **HTML5**: Clean, semantic markup

## Getting Started

### What You Need
- Java 17 or higher
- Maven 3.6 or higher
- A modern web browser

### Installation Steps

1. **Get the code**
   ```bash
   git clone https://github.com/yourusername/sentiment-analyzer-app.git
   cd sentiment-analyzer-app
   ```

2. **Build it**
   ```bash
   mvn clean compile
   ```

3. **Run it**
   ```bash
   mvn spring-boot:run
   ```

4. **Open in browser**
   - Web Interface: http://localhost:8080
   - API Endpoint: http://localhost:8080/api/analyze
   - Health Check: http://localhost:8080/api/health

## How to Use

### Web Interface

1. Open your browser and go to `http://localhost:8080`
2. Type or paste text in the input field
3. Click "Analyze Sentiment" or press Enter
4. View the results with confidence scores
5. Check your analysis history below

### API Usage

#### Analyze Text Sentiment

```bash
curl -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is absolutely wonderful!"}'
```

**Example Response:**
```json
{
  "text": "This is absolutely wonderful!",
  "sentiment": "Positive",
  "confidence": 0.75,
  "positiveScore": 0.75,
  "negativeScore": 0.0,
  "neutralScore": 0.25
}
```

#### Check Application Health

```bash
curl http://localhost:8080/api/health
```

## API Reference

### POST /api/analyze

Analyzes the sentiment of your text.

**Request:**
```json
{
  "text": "Your text here"
}
```

**Response:**
```json
{
  "text": "Your text here",
  "sentiment": "Positive|Negative|Neutral",
  "confidence": 0.75,
  "positiveScore": 0.75,
  "negativeScore": 0.0,
  "neutralScore": 0.25
}
```

### GET /api/health

Simple health check to see if the app is running.

**Response:**
```
Sentiment Analyzer App is running!
```

## How It Works

The app uses a layered architecture:

```
┌─────────────────┐
│   Frontend      │  ← User interface
├─────────────────┤
│   Controller    │  ← API endpoints
├─────────────────┤
│   Service       │  ← Business logic
├─────────────────┤
│   Stanford      │  ← NLP processing
│   CoreNLP       │
└─────────────────┘
```

**What happens when you analyze text:**

1. **Frontend** sends your text to the backend
2. **Controller** receives the request and passes it to the service
3. **Service** processes the text through Stanford CoreNLP
4. **CoreNLP** analyzes each sentence for sentiment
5. **Service** calculates overall scores and classification
6. **Controller** returns the results to the frontend
7. **Frontend** displays the results and updates counters

## Configuration

The app uses sensible defaults but you can customize:

- **Port**: Change `server.port` in `application.properties`
- **CORS**: Currently allows all origins for development
- **CoreNLP**: Configured with tokenize, ssplit, pos, parse, lemma, and sentiment annotators

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/sentiment/analyzer/
│   │       ├── SentimentAnalyzerApplication.java  ← Main app class
│   │       ├── controller/
│   │       │   └── SentimentController.java       ← API endpoints
│   │       ├── service/
│   │       │   └── SentimentAnalysisService.java  ← Business logic
│   │       └── dto/
│   │           ├── SentimentRequest.java          ← Request data
│   │           └── SentimentResponse.java         ← Response data
│   └── resources/
│       ├── static/
│       │   ├── index.html                         ← Main page
│       │   └── js/
│       │       └── sentiment-analyzer.js         ← Frontend logic
│       └── application.properties                 ← Configuration
└── test/
    └── java/
        └── com/sentiment/analyzer/
            └── SentimentAnalyzerApplicationTests.java
```

## Development

### Building

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package as JAR
mvn package

# Run the JAR
java -jar target/sentiment-analyzer-app-1.0.0.jar
```

### Adding Features

The code is organized to make it easy to add new features:

- **New API endpoints**: Add methods to `SentimentController`
- **Business logic**: Extend `SentimentAnalysisService`
- **Frontend features**: Modify `sentiment-analyzer.js`
- **Data models**: Update the DTOs in the `dto` package

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with a clear message (`git commit -m 'Add amazing feature'`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Troubleshooting

### Common Issues

**Port 8080 already in use:**
```bash
# Find what's using the port
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>
```

**Java version issues:**
```bash
# Check your Java version
java -version

# Should show Java 17 or higher
```

**Maven issues:**
```bash
# Clean and try again
mvn clean
mvn spring-boot:run
```

**Application won't start:**
- Check if port 8080 is free
- Make sure Java 17+ is installed
- Verify Maven is working: `mvn --version`

**Frontend not loading:**
- Check browser console for errors
- Make sure the backend is running
- Try clearing browser cache

## Performance Notes

- **First startup**: Takes a few seconds to load CoreNLP models
- **Memory usage**: CoreNLP models use about 500MB RAM
- **Response time**: Analysis typically takes 100-500ms depending on text length
- **Scalability**: Built for single-user or small-scale use

## Security Considerations

- **CORS**: Currently allows all origins (fine for development)
- **Input validation**: Basic null/empty checks implemented
- **Error handling**: Generic error messages to avoid information leakage
- **Local storage**: Data stays on user's device

## Future Improvements

Some ideas for future versions:
- User authentication and accounts
- Batch processing for multiple texts
- Export results to CSV/PDF
- More detailed sentiment analysis
- Support for other languages
- Docker containerization

## License

This project is open source under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stanford CoreNLP](https://stanfordnlp.github.io/CoreNLP/) for the powerful NLP capabilities
- [Spring Boot](https://spring.io/projects/spring-boot) for the excellent framework
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful UI components

## Support

Need help? Here are your options:

1. Check the existing [Issues](https://github.com/yourusername/sentiment-analyzer-app/issues)
2. Create a new issue with details about your problem
3. Reach out to the maintainers

## Changelog

### Version 1.0.0
- Initial release
- Basic sentiment analysis
- Web interface
- REST API
- History tracking
- Local storage

---

**Built with ❤️ by Vishnu using Spring Boot and Stanford CoreNLP**
