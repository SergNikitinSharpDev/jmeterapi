const jmRoutes = require('./jmeter_routes');
module.exports = function(app) {
  jmRoutes(app);
};
