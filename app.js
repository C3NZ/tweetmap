var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Twitter = require('twitter');
var config = require('./config.json');

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

var gstream;

function start_streaming(query) {
  client.stream('statuses/filter', {track: query}, function(stream) {
    gstream = stream;

    stream.on('data', function(tweet) {
      if(gstream != stream) return;
      if(tweet.text === null || tweet.text === undefined) return;
      if(tweet.place === null || tweet.place === undefined) return;
      console.log(tweet);
      io.emit('new_tweet', { name: tweet.user.screen_name, text: tweet.text, twitpic: tweet.user.profile_image_url, place: tweet.place.full_name});
    });

    stream.on('error', function(error) {
      throw error;
    });
  });
}


io.on('connection', function(socket){
  socket.on('query', function(query){
    start_streaming(query);
  });
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
