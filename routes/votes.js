var express = require('express');
var router = express.Router();

var Vote = require('../models/vote');
var User = require('../models/user');
var Round = require('../models/round');
var twilio = require('twilio/lib');
var accountSid = 'AC282d3459f9f433ad7578a0621b3e6669';
var authToken = "7321a55ba898fb87224757cf1a1d71c4";
var client = twilio(accountSid, authToken);

var getUserByNumber = function(number, done) {
	User.findOne({"number": number}, function(err, user) {
		if (err) {
			done(err,null);
		}
		done(null, user);
	});
}

var getCurrentRound = function(done) {
	Round.findOne({'active': true}, function(err, round) {
		if (err) {
			done(err, null)
		} else {
			done(null, round);
		}
	})
}

var sendMessage = function(number, body) {
	client.messages.create({
    body: body,
    to: number,
    from: "+16179348497"
	}, function(err, message) {
    process.stdout.write(message.sid);
	});
}


// don't judge me for this method pls pls pls
router.post('/', function(req, res) {
	var voteVal = req.body.Body;
	var voteFrom = req.body.From;
	getCurrentRound(function(err, round) {
		getUserByNumber(voteFrom, function(err, user) {
			if (!err) {
				if (user.currentAssignment) {
					if (!user.done && voteVal.toLowerCase().indexOf("done") != -1) {
						user.update({$set: {done: true}}, {upsert: false}, function(err) {
							if (!user.previousAssignment) {
								sendMessage(voteFrom, "Awesome :)");
							} else {
								sendMessage(voteFrom, "Awesome. In your opinion, was this project more or less impressive than the last project you judged? Text back \"more\" or \"less\".");
							}
						});
					} else if (user.done && !user.voted && (voteVal.toLowerCase() == "more" || voteVal.toLowerCase() == "less")) {
						var vote = {};
						if (voteVal.toLowerCase().indexOf("more") != -1 && user.previousAssignment) {
							vote = {teamA: user.previousAssignment, teamB: user.currentAssignment, better: true};
						} else if (voteVal.toLowerCase().indexOf("less") != -1 && user.previousAssignment) {
							vote = {teamA: user.previousAssignment, teamB: user.currentAssignment, better: false};
						}
						user.update({$set: {voted: true}}, {upsert: false}, function(err) {
							round.update({$push: { 'votes': vote }} , {upsert:true}, function(err) {
								if (!err) { // already voted
									sendMessage(voteFrom, "Thank you! Vote received.");
								} else {
									console.log("uh oh error " + err);
								}
							});
						});
					}
				} else {
					console.log("no current assignment");
				}
			}
		});
	});
	res.send();
});

module.exports = router;
