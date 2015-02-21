var express = require('express');
var router = express.Router();

var Vote = require('../models/vote');
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

router.post('/', function(req, res) {
	var voteVal = req.body.Body;
	var voteFrom = req.body.From;

	getUserByNumber(voteFrom, function(err, user) {
		if (!err) {
			if (voteVal.toLowerCase() == "done") {
				if (!users[i].previousStatus) {
					client.messages.create({
				    body: "Awesome :)",
				    to: voteFrom,
				    from: "+16179348497"
					}, function(err, message) {
				    process.stdout.write(message.sid);
					});
				} else {
					client.messages.create({
				    body: "Awesome. In your opinion, was this project more or less impressive than the last project you judged? Text back \"better\" or \"worse\".",
				    to: voteFrom,
				    from: "+16179348497"
					}, function(err, message) {
				    process.stdout.write(message.sid);
					});
				}
			} else if (voteVal.toLowerCase() == "better") {
				client.messages.create({
				    body: "Thank you! Vote received.",
				    to: voteFrom,
				    from: "+16179348497"
				}, function(err, message) {
				    process.stdout.write(message.sid);
				});
			} else if (voteVal.toLowerCase() == "worse") {
				client.messages.create({
				    body: "Thank you! Vote received.",
				    to: voteFrom,
				    from: "+16179348497"
				}, function(err, message) {
				    process.stdout.write(message.sid);
				});
			}
		}
	});
	
	res.send();
});

module.exports = router;
