const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const cheerio = require('cheerio');

require("dotenv").config();

let unsuccessfulResponseQueue = [];

let list = process.env.PROXY_LIST;

async function parseUrl(url) {
    const arr = url.split('@');

    const auth = arr[0];
    const address = arr[1];

    let obj = {
        proxyAddress: address,
        proxyAuth: auth
    };

    return obj;
}

async function fetchAndParse(url, proxy) {
    let driver;
    try {
        const proxyAddress = proxy.proxyAddress;
        const proxyAuth = proxy.proxyAuth;

        const chromeOptions = new chrome.Options()
            .headless()
            .addArguments(`--proxy-server=http://${proxyAddress}`)
            .addArguments(`--proxy-auth=${proxyAuth}`);

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();

        await driver.get(url);

        // Wait for the page to load and display the title
        await driver.wait(until.titleIs('expected title'), 10000);

        const body = await driver.findElement(By.tagName('body')).getAttribute('innerHTML');
        const $ = cheerio.load(body);

        // removing the unwanted css from the body

        $('.footer, .ad-container').remove();
        $('script, style').remove();
        let text = $('body').text();

        console.log($('title').text());

        return {
            status: 200,
            message: 'OK',
            data: text,
            url: url
        };

    } catch (error) {
        console.error('Error fetching the URL:', error);
        return {
            status: 500,
            message: error.message,
            data: null,
            url: url
        };
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

async function loginToLinkedIn(driver) {
    const username = process.env.LINKEDIN_USERNAME;
    const password = process.env.LINKEDIN_PASSWORD;

    await driver.get('https://www.linkedin.com/login');
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.xpath("//button[@type='submit']")).click();

    // Wait for the login to complete   
    await driver.wait(until.urlContains('feed'), 1500);
}

async function fetchAndParse(url, proxy) {
    let driver;
    try {
        const proxyAddress = proxy.proxyAddress;
        const proxyAuth = proxy.proxyAuth;

        const chromeOptions = new chrome.Options()
            .headless()
            .addArguments(`--proxy-server=http://${proxyAddress}`)
            .addArguments(`--proxy-auth=${proxyAuth}`);

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();

        if (url.includes('linkedin.com')) {
            await loginToLinkedIn(driver);
        }

        await driver.get(url);

        // Wait for the page to load and display the title
        await driver.wait(until.titleIs('expected title'), 10000);

        const body = await driver.findElement(By.tagName('body')).getAttribute('innerHTML');
        const $ = cheerio.load(body);

        $('.footer, .ad-container').remove();
        $('script, style').remove();
        let text = $('body').text();

        console.log($('title').text());

        return {
            status: 200,
            message: 'OK',
            data: text,
            url: url
        };

    } catch (error) {
        console.error('Error fetching the URL:', error);
        return {
            status: 500,
            message: error.message,
            data: null,
            url: url
        };
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}
function selectOneProxyUrl(list) {
    const rand = Math.floor(Math.random() * list.length);
    const oneProxy = list[rand];

    return oneProxy;
}

async function pipeline(urlToScrape, proxyUrl) {
    const obj = await parseUrl(proxyUrl);
    const response = await fetchAndParse(urlToScrape, obj);

    return response;
}

// removing the successful urls from all the urls which are being processed successful.

// async function removeSuccessfulUrls(urlsToScrape, successfulResponses) {
//     const successfulUrls = successfulResponses.map((response) => response.url);

//     return urlsToScrape.filter((url) => !successfulUrls.includes(url));

// }


exports.batchPipelineSelenium = async function batchPipelineSelenium(urlsToScrape, proxyList) {
    const responses = await Promise.all(urlsToScrape.map((url) => pipeline(url, selectOneProxyUrl(proxyList))));

    let successfulResponses = responses.filter((response) => response.status === 200);
    let unsuccessfulResponses = responses.filter((response) => response.status !== 200);

    // removeSuccessfulUrls(urlsToScrape, successfulResponses);

    unsuccessfulResponseQueue = unsuccessfulResponses;

    
    return { successfulResponses, unsuccessfulResponses };
}



