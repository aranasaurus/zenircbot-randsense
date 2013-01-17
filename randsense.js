var ZenIRCBot = require('zenircbot-api').ZenIRCBot;
var zen = new ZenIRCBot();
var sub = zen.get_redis_client();
var http = require('http');

zen.register_commands('randsense.js', [{
    name: '!randsense',
    description: 'Fetch a randomly generated sentence from http://jameydeorio.com/randsense'
}]);

sub.subscribe('in');
sub.on('message', function( channel, message ) {
    var msg = JSON.parse(message);
    if (msg.version == 1) {
        if (msg.type == 'privmsg') {
            if (/^!randsense$/i.test(msg.data.message)) {
                console.log('sending request');
                var options = {
                    host: 'jameydeorio.com',
                    port: 80,
                    path: '/randsense/generate/',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                http.get(options, function(res) {
                    var sentenceData = '';
                    res.setEncoding('utf8');

                    res.on('data', function(chunk) {
                        sentenceData += chunk;
                    });

                    res.on('end', function() {
                        if (sentenceData) {
                            var sentence = JSON.parse(sentenceData);
                            zen.send_privmsg(msg.data.channel, sentence.sentence);
                        }
                    });
                });
            }
        }
    }
});
