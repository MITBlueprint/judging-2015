var mongoose = require('mongoose');
var Vote = require('./vote');

var roundSchema = mongoose.Schema({
	name : String,
    numTeams: Number,
    numJudges: Number,
    numPeriods: Number,
    currentPeriod: Number,
    active: Boolean,
    votes: [Vote]
});

module.exports = mongoose.model('Round', roundSchema);