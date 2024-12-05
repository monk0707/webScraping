const express = require('express');
const bodyParser = require('body-parser');
const { dot } = require('node:test/reporters');
const dotenv = require('dotenv');
const { scrapeUrls } = require('./controllers/scrapeUrls.js');

dotenv.config();

const app = express();
const port = `${process.env.PORT}` || 4000;

app.use(bodyParser.json());

app.get('/alchemyst-ai/scrape',scrapeUrls);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});