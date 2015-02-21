var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name : String,
    number:  { type: String, required: true, unique: true, trim: true },
    previousAssignment : String,
    currentAssignment : String
});

module.exports = mongoose.model('User', userSchema);