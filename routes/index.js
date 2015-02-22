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

var sendMessage = function(number, body) {
	client.messages.create({
    body: body,
    to: number,
    from: "+16179348695"
	}, function(err, message) {
    process.stdout.write(message.sid);
	});
}

var updateRoundStatus = function(roundID, updates, done) {
	var status = updates.state
	if (status == "active") {
		Round.update({active: true}, { $set: {active: false}}, {upsert: false}, function(err) {
			Round.update({"_id": roundID}, { $set: {active: true}}, {upsert: false}, function(err) {
				if (err) {
					done(err);
				} else {
					done(null)
				}
			});
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
				judgingPeriodStarts(updates.count, roundID);
			}  
		});
	}
	done(null);
}

var judgingPeriodStarts = function(period, roundID) {
	var teamNum;
	getAllUsers(function(err, allUsers) {
		getRound(roundID, function(err, round) {
			var clone = round.remaining.slice(0);
			queue = [];
			for (var j = 0; j < allUsers.length; j++) {
				if (clone.length > 0) {
					var index = Math.floor(Math.random()*clone.length) // random
					queue.push(clone.splice(index, 1));
				}
			}
			// update round with new queue
			round.update({ $set: {remaining: clone}}, {upsert: false}, function(err) {
				for (var i = 0; i < allUsers.length; i++) {
					var prevAssign = allUsers[i].currentAssignment;
					var number = allUsers[i].number;
					var userID = allUsers[i].id;
					if (prevAssign && parseInt(period) > 1) {
						var x = 0;
						while (queue[x] == prevAssign && x < queue.length) {
							x = x + 1;
						}
						if (x < queue.length) {
							var teamNum = queue[x]
							queue.splice(0, 1);
							updateAndSendAssignmentPrev(userID, prevAssign, teamNum, number, period);
						}
					} else {
						var teamNum = queue.splice(0, 1);
						updateAndSendAssignment(userID, teamNum, number, period);
					}
				}
			});
		});
	});
}

var updateAndSendAssignmentPrev = function(userID, prevAssign, teamNum, number, period) {
	User.update({"_id": userID}, {$set: {previousAssignment: prevAssign, currentAssignment: teamNum, done: false, voted: false}}, {upsert: false}, function(err) {
		console.log("assigning new team to " + number);
		sendMessage(number, "Judging period " + period.toString() + " has begun. Please listen to team " + teamNum + " present and text \"Done\" when you have finished.");
	});
}

var updateAndSendAssignment = function(userID, teamNum, number, period) {
	User.update({"_id": userID}, {$set: {previousAssignment: null, currentAssignment: teamNum, done: false, voted: false}}, {upsert: false}, function(err) {
		console.log("assigning new team to " + number);
		sendMessage(number, "Judging period " + period.toString() + " has begun. Please listen to team " + teamNum + " present and text \"Done\" when you have finished.");
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
	getAllUsers(function(err, allUsers) {
		// generate team array
		var numViews = parseInt(allUsers.length * req.body.numPeriods);
		console.log(typeof(req.body.teams));
		var roundTeams = req.body.teams.split(",");
		var teamMax = roundTeams.length;
		var teamIndex = 0;
		var queue = [];
		for (var i = 0; i < numViews; i++) {
			queue.push(roundTeams[teamIndex]);
			teamIndex = (teamIndex + 1)%teamMax; 
		}
		// create round
		var round = new Round({name: req.body.name, teams: roundTeams, numJudges: allUsers.length, numPeriods: req.body.numPeriods, currentPeriod: 0, remaining: queue});
		round.save();
		res.redirect("/");
	});
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