const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = ({ uri }) => {
  // Database connection
  // Masking URI for safer logging
  const maskedUri = uri ? uri.replace(/:([^@]+)@/, ':****@') : 'undefined';
  console.log('Connecting to MongoDB: ' + maskedUri);

  mongoose.connect(uri)
    .catch(err => {
      console.error('Mongoose initial connection error: ' + err);
    });

  // When successfully connected
  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection successful');
  });

  // If the connection throws an error
  mongoose.connection.on('error', function (err) {
    console.error('Mongoose default connection error: ' + err);
    if (err.message && err.message.includes('alert number 80')) {
      console.log('💡 TIP: SSL alert 80 often means MongoDB Atlas is blocking the connection.');
      console.log('   Please ensure 0.0.0.0/0 is ACTIVE in Atlas Network Access and your password is correct.');
    }
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
}
