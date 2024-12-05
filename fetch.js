const axios = require('axios');
const cheerio = require('cheerio');

// const url = 'https://example.com';

async function parseUrl(url){

        arr = url.split(':');

        const user = arr[0];
        const pass = arr[1].split('@')[0];
        const host = arr[1].split('@')[1];
        const port = arr[2];

        let obj = {
            host : host,
            port : port ,
            auth : {
            username : user,
            password : pass
        }};

        return obj;
    
}

async function fetchAndParse(url,proxy) {
    try {

        const response = await axios.get(url, { proxy });

        if(response.status !== 200){
            return {
                status: response.status,
                message: response.statusText,
                data: null,
                url : url
            }

        }

        const body = response.data;
        const $ = cheerio.load(body);

        $('.footer, .ad-container').remove();
        $('script, style').remove();
        let text = $('body').text();

        // Use the $ operator to parse and manipulate the HTML
        console.log($('title').text());

        return {
            status: response.status,
            message: response.statusText,
            data: text,
            url : url
        }

    } catch (error) {
        console.error('Error fetching the URL:', error);
    }
}

// select one proxy from the list

function selectOneProxyUrl(list){

    const rand = Math.floor(Math.random() * list.length);
    const oneProxy = list[rand];

    return oneProxy;
}

const obj = parseUrl(oneProxy);

async function pipeline(urlToScrape, proxyUrl){

    const obj = await parseUrl(proxyUrl);
    const response = await fetchAndParse(urlToScrape,obj);

    return response;
}

exports.batchPipelineFetch = async function batchPipelineFetch(urlsToScrape, proxyList){
    responses = await Promise.all(urlsToScrape.map((url) => pipeline(url, selectOneProxyUrl(proxyList))));

    let successfulResponses = responses.filter((response) => response.status === 200);
    let unsuccessfulResponses = responses.filter((response) => response.status !== 200);

    return {successfulResponses, unsuccessfulResponses};
}

// fetchAndParse('https://getalchemystai.com/').then((response) => {
//     console.log(response,obj);
// });
