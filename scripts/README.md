# Media capture scripts

Captures UI screenshots and a looping demo GIF for every main scenario, then updates `README.md`.

## Scenarios covered

| File | Scenario |
|------|----------|
| `01-home-empty.png` | Empty home state |
| `02-validation-error.png` | Empty submit validation error |
| `03-positive-result.png` | Positive sentiment result |
| `04-negative-result.png` | Negative sentiment result |
| `05-neutral-result.png` | Neutral sentiment result |
| `06-history-populated.png` | History with mixed results |
| `demo.gif` | Full walkthrough animation |

## Run

```bash
# App must be running
mvn spring-boot:run

# In another terminal
cd scripts
npm install
npx playwright install chromium
npm run media
```

Outputs land in `docs/media/`. Override the base URL with `BASE_URL=http://127.0.0.1:8080 npm run media`.
