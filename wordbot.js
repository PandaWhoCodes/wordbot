var request = require('request');
var wordNet = require("wordnet-magic");
var wn = wordNet(null, false);
var util = require("util");

var URL = 'https:\/\/api.projectoxford.ai\/luis\/v2.0\/apps\/d9b279d0-a895-4474-bad2-ada7ed65bbdf\?subscription-key=USEYOUROWNKEY&q=';

// Server code starts here
//converting nodejs console into a CLI
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> '
});

rl.prompt(); // prompting the usesr to give an input

rl.on('line', (line) => {
    request(URL + line.trim(), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            messagehandler(res); // Print the google web page.
        } else {
            console.log("Sorry! Something doesn't seem right at the moment. Kindly try again after sometime");
        }
    });
    rl.prompt();
}).on('close', () => {
    console.log('Have a great day!');
    process.exit(0);
});

function messagehandler(message) {

    if (message["topScoringIntent"]["intent"] == "meaning") {
        while (true) {
            var entities = message["entities"];
            var entity = extractWord(entities);
            if (entity != "NO") {
                extractMeaning(entity);
                break;
            } else {
                console.log("Oop's.. I didn't quite get your word. Could you phrase it a little better for me?");
                break;
            }
        }
    } else if (message["topScoringIntent"]["intent"] == "synonyms") {

        var entities = message["entities"];
        var entity = extractWord(entities);
        if (entity != "NO") {
            extractSynonyms(entity);
        } else {
            console.log("Oop's.. I didn't quite get your word. Could you phrase it a little better for me?");
        }

    } else if (message["topScoringIntent"]["intent"] == "antonyms") {

        var entities = message["entities"];
        var entity = extractWord(entities);
        if (entity != "NO") {
            extractAntonyms(entity);
        } else {
            console.log("Oop's.. I didn't quite get your word. Could you phrase it a little better for me?");
        }
    }


}

function extractWord(entities) {
    for (var i = 0; i < entities.length; i++) {
        var obj = entities[i];
        if (obj.type == "word") {
            return obj.entity;
        }
    }
    return "NO";
}

function extractMeaning(word) {
    var walk = new wn.Word(word);
    walk.getSynsets(function(err, data) {
        console.log(util.inspect(data[0]["definition"], null, 3));
    });
}

function extractSynonyms(word) {
    var walk = new wn.Word(word);
    walk.getSynsets(function(err, data) {
        var worddata = data[0]["words"];
        var finalOutput = "";
        for (var i = 0; i < worddata.length; i++) {
            if (i < worddata.length - 1)
                finalOutput += worddata[i]["lemma"] + ",";
            else {
                finalOutput += worddata[i]["lemma"];
            }
        }
        console.log(finalOutput);
    });
}

function extractAntonyms(word) {
    //console.log(word);
    var white = new wn.Word(word);
    white.getAntonyms().then(function(synsetArray) {
        var finalOutput = "";
        for (var i = 0; i < synsetArray.length; i++) {
            if (i < synsetArray.length - 1)
                finalOutput += synsetArray[i]["antonym"] + ",";
            else {
                finalOutput += synsetArray[i]["antonym"];
            }
        }
        console.log(finalOutput);
    });
}
