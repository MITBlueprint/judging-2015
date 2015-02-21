var express = require('express');
var router = express.Router();
var Round = require('../models/round');
var User = require('../models/user');
var twilio = require('twilio/lib');
var accountSid = 'AC282d3459f9f433ad7578a0621b3e6669';
var authToken = "7321a55ba898fb87224757cf1a1d71c4";
var client = twilio(accountSid, authToken);

var getAllUsers = function(done) {
	User.find(function(err, allUsers) {
		if (err) {
			done(err,null);
		}
		done(null, allUsers);
	});
}

var getAllRounds = function(done) {
	Round.find(function(err, allRounds) {
		if (err) {
			done(err,null);
		} else {
			done(null, allRounds);
		}
	});
}

var getRound = function(roundID, done) {
	Round.findOne({'_id': roundID}, function(err, round) {
		if (err) {
			done(err, null)
		} else {
			done(null, round);
		}
	})
}

var updateRoundStatus = function(roundID, updates, done) {
	var status = updates.state
	if (status == "active") {
		Round.update({"_id": roundID}, { $set: {active: true}}, {upsert: false}, function(err) {
			if (err) {
				done(err);
			} else {
				Round.update({"_id": {"$ne" : roundID}}, { $set: {active: false}}, {upsert: false}, function(err) {
					if (err) {
						done(err);
					} else {
						done(null)
					}
				});
			}
		});
	} else if (status == "inactive") {
		Round.update({"_id": roundID}, { $set: {active: false}}, {upsert: false}, function(err) {
			if (err) {
				done(err);
			} else {
				done(null);
			}
		});
	} else if (status == "increment") {
		console.log("incrementing: " + updates.count);
		Round.update({"_id": roundID}, { $set: {currentPeriod: updates.count}}, {upsert: false}, function(err) {
			if (err) {
				done(err);
			} else {
				judgingPeriodStarts(updates.count);
				done(null);
			}
		});
	}
	done(null);
}

var judgingPeriodStarts = function(period) {
	var teamNum = "A";
	getAllUsers(function(err, allUsers) {
		for (var i = 0; i < allUsers.length; i++) {
			client.messages.create({
		    body: "Judging round " + period.toString() + " has begun. Please listen to team " + teamNum + " present and text \"Done\" when you have finished.",
		    to: allUsers[i].number,
		    from: "+16179348497"
			}, function(err, message) {
			    process.stdout.write(message.sid);
			});
		} 
	});
}

router.get('/', function(req, res) {
	getAllRounds(function(err, allRounds) {
		if (!err) {
			res.render('index.ejs', {
				rounds: allRounds
			}); 
		} else {
			console.log("error: " + str(err));
		}
	});
});

router.post('/', function(req, res) {
	var round = new Round({name: req.body.name, numTeams: req.body.numTeams, numJudges: req.body.numJudges, numPeriods: req.body.numPeriods, currentPeriod: 0});
	round.save();
	res.redirect("/");
});

router.get('/:id', function(req, res) {
	getRound(req.params.id, function(err, currRound) {
		if (!err) {
			res.render('round.ejs', {
				round: currRound
			});
		}
	});
});

router.post('/:id', function(req, res) {
	updateRoundStatus(req.params.id, req.body, function(err) {
		res.send();
	})
});

module.exports = router;