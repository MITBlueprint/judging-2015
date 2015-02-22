var mongoose = require('mongoose');

var vote = mongoose.Schema({
    teamA : String,
    teamB : String,
    better : Boolean // whether team A is better than team B
});

var roundSchema = mongoose.Schema({
	name : String,
    teams: [String],
    numJudges: Number,
    numPeriods: Number,
    currentPeriod: Number,
    active: Boolean,
    votes: [vote],
    remaining: [String]
});

module.exports = mongoose.model('Round', roundSchema);