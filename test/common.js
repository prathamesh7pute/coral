var mongoose = require("mongoose");

module.exports = function () {
	return mongoose.createConnection('mongodb://localhost/backbone_mongoose_test', {});
};

module.exports.mongoose = mongoose;
