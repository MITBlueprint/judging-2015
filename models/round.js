var mongoose = require('mongoose');

var vote = mongoose.Schema({
    teamA : String,
    teamB : String,
    better : Boolean // whether team A is better than team B
});

var roundSchema = mongoose.Schema({
	name : String,
    numTeams: Number,
    numJudges: Number,
    numPeriods: Number,
    currentPeriod: Number,
    active: Boolean,
    votes: [vote]
});

module.exports = mongoose.model('Round', roundSchema);