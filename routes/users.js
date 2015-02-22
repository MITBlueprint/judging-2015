var express = require('express');
var router = express.Router();
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

var deleteUser = function(userID, done) {
	User.remove({"_id": userID}, function(err) {
		if (err) {
			done(err);
		} else {
			done(null);
		}
	});
}

router.get('/', function(req, res) {
	getAllUsers(function(err, allUsers) {
		res.render('users.ejs', {
			users: allUsers
		}); 
	});
});

router.post('/', function(req, res) {
	var user_num = "+1"+req.body.number;
	var user = new User({name: req.body.name, number: user_num});
	user.save(function(err) {
		if (!err) { // already voted
			client.messages.create({
			    body: "Welcome to the HackMIT Blueprint judging system!",
			    to: user_num,
			    from: "+16179348695"
			}, function(err, message) {
			    process.stdout.write(message.sid);
			});
		}
	});
	res.redirect("/users");
});

router.delete('/:id', function(req, res) {
	deleteUser(req.params.id, function(err) {
		res.send();
	});
});

module.exports = router;
