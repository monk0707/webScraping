import batchPipelineFetch from '../fetchScraping.js';
import batchPipelineSelenium from '../seleniumScraping.js';
require("dotenv").config()

function segregateURLs(urlsToScrape) {
    const socialMediaUrls = [];
    const otherUrls = [];

    urlsToScrape.forEach(url => {
        if (url.includes('linkedin.com') || url.includes('twitter.com') || url.includes('reddit.com')) {
            socialMediaUrls.push(url);
        } else {
            otherUrls.push(url);
        }
    });

    return { socialMediaUrls, otherUrls };
}

exports.scrapeUrls = async (req, res) => {
  const { urlsToScrape } = req.body
  console.log(urlsToScrape)
  try {

    const { socialMediaUrls, otherUrls } = segregateURLs(urlsToScrape);

    const socialMediaUrlsResponse = batchPipelineSelenium(socialMediaUrls, process.env.PROXY_LIST);
    const otherUrlsResponse = batchPipelineFetch(otherUrls, process.env.PROXY_LIST);

    const responses = {
      socialMediaUrlsResponse,
      otherUrlsResponse
    }

    return res.json({
      success: true,
      message: "URLS scraped successfully",
      responses : responses
    })
  } catch (error) {
    console.log("Error", error)
    console.log("Error message :", error.message)
    return res.json({
      success: false,
      message: "Urls scraping unsuccessful"
    })
  }
}