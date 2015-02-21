var mongoose = require('mongoose');

var voteSchema = mongoose.Schema({
    teamA : String,
    teamB : String,
    better : Boolean // whether team A is better than team B
});

module.exports = mongoose.model('Vote', voteSchema);