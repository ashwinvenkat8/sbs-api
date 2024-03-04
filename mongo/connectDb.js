const mongoose = require('mongoose');

function connectDb() {
	mongoose.connect(process.env.MONGO_URI);
	mongoose.set('strict', true);
	mongoose.set('strictQuery', true);

	const db = mongoose.connection;
	db.on("error", console.error.bind(console, "Connection error: "));
	db.once("open", function () {
		console.log("Database connected successfully");
	});
}

module.exports = connectDb;
