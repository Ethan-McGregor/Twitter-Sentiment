'use strict';

/* 
Ethan McGregor
10/28/2016
T.A Luis Naranjo
*/




//Event listener for typed twitterhandle
var searchBox = document.querySelector('input');
var button = document.querySelector('button');
button.addEventListener('click', function (each) {
    var url = "https://faculty.washington.edu/joelross/proxy/twitter/timeline/?screen_name=" + searchBox.value + "&count=100";

    loadTweets(url);
});





//cleens up strings of words for later use
function extractWords(words) {
    var words = words.split(/\W+/);
    var wordList = [];
    for (var i = 0; i < words.length; i++) {

        if (words[i].length > 1) {
            wordList.push(words[i].toLowerCase());
        }
    }
    return (wordList);
}

//mathes words with their proper sentiment
function findSentimentWords(wordList) {
    var sentiments = { 'positive': [], 'negative': [], 'anger': [], 'anticipation': [], 'disgust': [], 'fear': [], 'joy': [], 'sadness': [], 'surprise': [], 'trust': [] };

    wordList.forEach(function (word) {
        var section = _SENTIMENTS[word];

        for (var key in section) {
            sentiments[key].push(word);
        }
    });
    
    return sentiments;
}

//finds the percent, frequency,and hastags used for each sentiment
function analyzeTweets(tweets) {
    var tweetData = { 'positive': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'trust': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'anticipation': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'joy': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'surprise': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'negative': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'sadness': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'disgust': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'fear': { 'percent': 0, 'frequency': [], 'hashtags': [] }, 'anger': { 'percent': 0, 'frequency': [], 'hashtags': [] } };
    var text = '';
    tweets.forEach(function (tweet) {
        text = text + (tweet['text'] + " ");
    });

    var wordList = extractWords(text);
    var emotions = findSentimentWords(wordList);
    console.log(emotions);
    for (var key in emotions) {
        tweetData[key]['percent'] = ((emotions[key].length / wordList.length) * 100);
    }

    tweetData = getFrequency(emotions, tweetData, "frequency");
    var hashtags = findHashtags(tweets, emotions, tweetData);
}

//finds hashtags for every tweet
function findHashtags(tweets, emotion, tweetData) {
    var sentiments = { 'positive': [], 'negative': [], 'anger': [], 'anticipation': [], 'disgust': [], 'fear': [], 'joy': [], 'sadness': [], 'surprise': [], 'trust': [] };

    var hashtags = "";
    tweets.forEach(function (tweet) {
        var text = "";
        var wordList = extractWords(tweet['text']);
        var emotions = findSentimentWords(wordList);
        for (var i = 0; i < (tweet.entities.hashtags.length); i++) {
            text = (tweet.entities.hashtags[i].text);
            for (var each in emotions) {
                if (emotions[each] != '') {
                    sentiments[each].push(text);

                }
            }
        }
        tweetData = getFrequency(sentiments, tweetData, "hashtags");

    });
    showStatistics(tweetData);

}

//displays visual information on the screen in the form of a table
function showStatistics(tweetData) {

    var table = document.querySelector('tbody');
    table.innerHTML = "";
    var row = document.createElement('tr');

    var selectRow = document.querySelector('tr');
    var data = document.createElement('td');
    var selectData = document.querySelector('td');
    selectRow = document.querySelector('tbody > tr');
    //for each sentiment make row and data
    for (var each in tweetData) {
        var row = document.createElement('tr');
        var emotion = document.createElement('td');
        var percent = document.createElement('td');
        var example = document.createElement('td');
        var hashtags = document.createElement('td');
        var number = numeral(tweetData[each]['percent']);

        for (var i = 0; i < tweetData[each]['frequency'].length; i++) {
            tweetData[each]['frequency'][i] = " " + tweetData[each]['frequency'][i];
        }
        for (var i = 0; i < tweetData[each]['hashtags'].length; i++) {
            tweetData[each]['hashtags'][i] = " #" + tweetData[each]['hashtags'][i];
        }
        table.append(row);
        emotion.append(each);
        percent.append(number.format('0.00') + "%");     //changes to correct format
        example.append(tweetData[each]['frequency']);
        hashtags.append(tweetData[each]["hashtags"]);
        row.append(emotion, percent, example, hashtags);

    }
}

//takes a url and loads tweets from twitters api
function loadTweets(url) {
    fetch(url).then(function (response) {
        var newPromise = response.json();
        return newPromise;
    }).then(function (data) { analyzeTweets(data) });

}

//gets most common woreds per sentiment
function getFrequency(emotions, tweetData, type) {

    for (var feeling in emotions) {
        var frequency = [];
        emotions[feeling].forEach(function (word) {
            if (frequency[word.toString()] == undefined) {
                frequency[word.toString()] = 1;
            } else {
                frequency[word.toString()]++;
            }
        });
        var topWords = [];
        var one = 0;
        var word = '';

        //This loop finds the first most used word
        for (var each in frequency) {
            if (frequency[each] > one) {
                one = frequency[each];

                word = each;
            }
        }
        if (word != '') {
            topWords[0] = word;
        }
        one = 0;
        word = '';
        //This loop finds the second most used word
        for (var each in frequency) {
            if (frequency[each] > one) {
                if (each != topWords[0]) {
                    one = frequency[each];
                    word = each;
                }
            }
        }
        if (word != '') {
            topWords[1] = word;
        }
        one = 0;
        word = '';

        //This loop finds the third most used word
        for (var each in frequency) {
            if (frequency[each] > one) {
                if (each != topWords[1] && each != topWords[0]) {
                    one = frequency[each];
                    word = each;
                }
                if (word != '') {
                    topWords[2] = word;
                }
            }
        }

        tweetData[feeling][type.toString()] = topWords;
    }

    return tweetData;

}
//show default ischool tweet screen

analyzeTweets(_SAMPLE_TWEETS);
