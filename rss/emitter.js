/*
This file takes an opml RSS/Atom list and adds it to an RSS event listener.

This then sends a signal to our python trader bot.
*/

var TRADING_BOT_URL = 'bot';
var OpmlParser = require('opmlparser')
  , request = require('request');

var opmlparser = new OpmlParser()
  , counter = 0;

var RssFeedEmitter = require('rss-feed-emitter');
var feeder = new RssFeedEmitter();

var req = request('https://gist.githubusercontent.com/ianseyer/1a7ac7c4f6381cb4f09519ae4a36d8ba/raw/489ae9c1b743e8bd0983bc6aa936988e28e92b09/git_50_coin_releases.opml');
req.on('error', done);
req.on('response', function (res) {
  if (res.statusCode != 200) return done(new Error('Bad status code'));
  this.pipe(opmlparser);
})

opmlparser.on('error', done);
opmlparser.once('readable', function () {
  console.log('This OPML is entitled: "%s"', this.meta.title);
});

//add atom feed to our rss listener
opmlparser.on('readable', function() {
  var outline;
  while (outline = this.read()) {
    if (outline['#type'] === 'feed') {
      counter++;
      feeder.add({
        url: outline.xmlurl,
        refresh: 2000
      })
    }
  }
});

opmlparser.on('end', function () {
  console.log('All done. Listening on %s feeds.', counter);
  feeder.on('new-item', function(item) {
    //Ship our new post off to the python bot for parsing
    var options = {
      url: TRADING_BOT_URL,
      method: 'POST',
      form: item
    }
    request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
})
  })
});

function done (err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }
}
