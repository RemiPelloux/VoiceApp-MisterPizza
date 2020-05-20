"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const https = require('https');
const async = require('async');
const restService = express();
var baseURL = "https://adwatch.fr/misterpizza/";

restService.use(
    bodyParser.urlencoded({
        extended: true
    })
);

restService.use(bodyParser.json());

function buildUrl(nomPizza, parametres, cb) {
    //buildUrl('Armenienne', 'ingredient')
    baseURL = "https://adwatch.fr/misterpizza/";
    baseURL += "?pizza=" + nomPizza + "&"
    if(cb) {
        parametres = cb;
    }
    switch (parametres) {
        case 'pizza.ingredients':
            baseURL += "ingredient=true"
            break
        case 'name':
            baseURL += "name=true"
            break
        case 'Méga':
            baseURL += "price_mega=true"
            break
        case 'Normal':
            baseURL += "price_normale=true"
            break
        case 'promo':
            baseURL += "promo=true"
            break
    }
    //console.log("URL : " + baseURL)
    return baseURL
}


function getInfoApi() {
    return new Promise(function (resolve, reject) {
        https.get(baseURL, (resp) => {
            console.log(baseURL)
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                console.log("data " + data)
                resolve(data)
            });

        }).on("error", (err) => {
            //console.log("Error: " + err.message);
            reject("Error: " + err.message);
        });
    })
}

function pizzaDataAPI(data) {
    //console.log(JSON.parse(data).Armenienne)
    //console.log("Pizza ingredient : " + data)
    console.log(JSON.parse(data))
    return JSON.parse(data)
}

var speechResponse = "";

function generateGoogleResponseIngredient(data) {
    console.log("generateGoogleResponse : " + data)
    speechResponse = {
        google: {
            expectUserResponse: true,
            richResponse: {
                items: [
                    {
                        simpleResponse: {
                            textToSpeech: data
                        }
                    }
                ]
            }
        }
    };
    return speechResponse
}

function generateGoogleResponsePrice(data) {
    data = data.replace('&nbsp;&euro;', ' euro')
    console.log("generateGoogleResponse : " + data)

    speechResponse = {
        google: {
            expectUserResponse: true,
            richResponse: {
                items: [
                    {
                        simpleResponse: {
                            textToSpeech: data
                        }
                    }
                ]
            }
        }
    };
    return speechResponse
}

restService.post("/echo", function (req, res) {
    if (req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.nomPizza) {
        var speech = "";

        var pizzaName = req.body.queryResult.parameters.nomPizza

        var intentContext = req.body.queryResult.intent.displayName
        //console.log(intentContext)

        if(intentContext === "pizza.price") {
            var taillePizza = req.body.queryResult.parameters.taillePizza
            buildUrl(pizzaName, intentContext, taillePizza)
            const myPromise = getInfoApi()

            myPromise
                .then(pizzaDataAPI)
                .catch(() => {
                    speech = "Houston Pizza, on a un soucis.";
                    console.error('[+] ERREUR')
                })
                .then(generateGoogleResponsePrice)
                .then(() => {
                    return res.json({
                        payload: speechResponse,
                        //data: speechResponse,
                        fulfillmentText: speech,
                        speech: speech,
                        displayText: speech,
                        source: "MisterPizza Voice app"
                    });
                })
        }

        if (intentContext === "pizza.ingredients") {
            buildUrl(pizzaName, intentContext)
            const myPromise = getInfoApi()

            myPromise
                .then(pizzaDataAPI)
                .catch(() => {
                    speech = "Houston Pizza, on a un soucis.";
                    console.error('[+] ERREUR')
                })
                .then(generateGoogleResponseIngredient)
                .then(() => {
                    return res.json({
                        payload: speechResponse,
                        //data: speechResponse,
                        fulfillmentText: speech,
                        speech: speech,
                        displayText: speech,
                        source: "MisterPizza Voice app"
                    });
                })
        }




    }


});

restService.post("/audio", function (req, res) {
    var speech = "";
    switch (req.body.result.parameters.AudioSample.toLowerCase()) {
        //Speech Synthesis Markup Language
        case "music one":
            speech =
                '<speak><audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
            break;
        case "music two":
            speech =
                '<speak><audio clipBegin="1s" clipEnd="3s" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
            break;
        case "music three":
            speech =
                '<speak><audio repeatCount="2" soundLevel="-15db" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
            break;
        case "music four":
            speech =
                '<speak><audio speed="200%" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
            break;
        case "music five":
            speech =
                '<audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio>';
            break;
        case "delay":
            speech =
                '<speak>Let me take a break for 3 seconds. <break time="3s"/> I am back again.</speak>';
            break;
        //https://www.w3.org/TR/speech-synthesis/#S3.2.3
        case "cardinal":
            speech = '<speak><say-as interpret-as="cardinal">12345</say-as></speak>';
            break;
        case "ordinal":
            speech =
                '<speak>I stood <say-as interpret-as="ordinal">10</say-as> in the class exams.</speak>';
            break;
        case "characters":
            speech =
                '<speak>Hello is spelled as <say-as interpret-as="characters">Hello</say-as></speak>';
            break;
        case "fraction":
            speech =
                '<speak>Rather than saying 24+3/4, I should say <say-as interpret-as="fraction">24+3/4</say-as></speak>';
            break;
        case "bleep":
            speech =
                '<speak>I do not want to say <say-as interpret-as="bleep">F&%$#</say-as> word</speak>';
            break;
        case "unit":
            speech =
                '<speak>This road is <say-as interpret-as="unit">50 foot</say-as> wide</speak>';
            break;
        case "verbatim":
            speech =
                '<speak>You spell HELLO as <say-as interpret-as="verbatim">hello</say-as></speak>';
            break;
        case "date one":
            speech =
                '<speak>Today is <say-as interpret-as="date" format="yyyymmdd" detail="1">2017-12-16</say-as></speak>';
            break;
        case "date two":
            speech =
                '<speak>Today is <say-as interpret-as="date" format="dm" detail="1">16-12</say-as></speak>';
            break;
        case "date three":
            speech =
                '<speak>Today is <say-as interpret-as="date" format="dmy" detail="1">16-12-2017</say-as></speak>';
            break;
        case "time":
            speech =
                '<speak>It is <say-as interpret-as="time" format="hms12">2:30pm</say-as> now</speak>';
            break;
        case "telephone one":
            speech =
                '<speak><say-as interpret-as="telephone" format="91">09012345678</say-as> </speak>';
            break;
        case "telephone two":
            speech =
                '<speak><say-as interpret-as="telephone" format="1">(781) 771-7777</say-as> </speak>';
            break;
        // https://www.w3.org/TR/2005/NOTE-ssml-sayas-20050526/#S3.3
        case "alternate":
            speech =
                '<speak>IPL stands for <sub alias="indian premier league">IPL</sub></speak>';
            break;
    }
    return res.json({
        speech: speech,
        displayText: speech,
        source: "webhook-echo-sample"
    });
});

restService.post("/video", function (req, res) {
    return res.json({
        speech:
            '<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
        displayText:
            '<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
        source: "webhook-echo-sample"
    });
});

restService.post("/slack-test", function (req, res) {
    var slack_message = {
        text: "Details of JIRA board for Browse and Commerce",
        attachments: [
            {
                title: "JIRA Board",
                title_link: "http://www.google.com",
                color: "#36a64f",

                fields: [
                    {
                        title: "Epic Count",
                        value: "50",
                        short: "false"
                    },
                    {
                        title: "Story Count",
                        value: "40",
                        short: "false"
                    }
                ],

                thumb_url:
                    "https://stiltsoft.com/blog/wp-content/uploads/2016/01/5.jira_.png"
            },
            {
                title: "Story status count",
                title_link: "http://www.google.com",
                color: "#f49e42",

                fields: [
                    {
                        title: "Not started",
                        value: "50",
                        short: "false"
                    },
                    {
                        title: "Development",
                        value: "40",
                        short: "false"
                    },
                    {
                        title: "Development",
                        value: "40",
                        short: "false"
                    },
                    {
                        title: "Development",
                        value: "40",
                        short: "false"
                    }
                ]
            }
        ]
    };
    return res.json({
        speech: "speech",
        displayText: "speech",
        source: "webhook-echo-sample",
        data: {
            slack: slack_message
        }
    });
});

restService.listen(process.env.PORT || 8000, function () {
    console.log("[+] Serveur opérationnel");
});
