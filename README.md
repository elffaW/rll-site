This project was bootstrapped with [React-Slingshot](https://github.com/coryhouse/react-slingshot).

See Getting Started and Machine Setup instructions in React-Slingshot README.


## RLL SITE
Website for displaying information about the RLL.

Visit here: https://rll.lol

### DEPLOYMENT INFO
- Deployed using Netlify CLI
- API uses Netlify Functions (managed AWS Lambda functions)
- Data for the site is stored in FaunaDB
- Data is also stored in a Google Sheets spreadsheet  
  - `tools/update-fauna-database.js` script pulls data from Sheets and upserts into Fauna
  - There is a separate utility for getting the Game Replay data into Sheets  
    - [RLL Replay Parser](https://github.com/elffaW/rll-replay-parser) - replays parsed with `carball`, data upserted with node (similar to `tools/update-fauna-database.js` script here)
