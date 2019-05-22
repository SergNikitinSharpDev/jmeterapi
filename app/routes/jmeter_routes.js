module.exports = function(app) {

	app.get('/', (req, res) => {
		res.sendFile('/home/ubuntu/jmeterapi/index.html');
	  });

	app.get('/ok', (req, res) => {
		res.sendStatus(200)
	  });

	app.get('/report', (req, res) => {
		var threads = 100;
		var ramp = 60;
		var duration = 120;

		var timestamp = + new Date();
		var execTest = `/home/ubuntu/apache-jmeter-5.1.1/bin/jmeter -n -t /home/ubuntu/jmx_scenarios/AutomatedTest.jmx   -JReportName=/home/ubuntu/jmeterapi/csv/r${timestamp} -JUsersPool=/home/ubuntu/jmx_scenarios/users_pool.csv -JThreads=${threads} -JRampUp=${ramp} -JDuration=${duration}`;
		var genReport = `/home/ubuntu/apache-jmeter-5.1.1/bin/jmeter -g /home/ubuntu/jmeterapi/csv/r${timestamp}.csv -o /home/ubuntu/jmeterapi/reports/r${timestamp}`;
		var shell = require('./shellHelper');
		shell.series([
			execTest, genReport
		], function(err){
		});
		res.send(`Report will be ready within ${duration} seconds. Check at http://:8001/r${timestamp}/index.html`)
	  });

	app.post('/report', (req, res) => {
		console.log(req);
		var threads = req.body.threads || 100;
		var ramp = req.body.ramp || 60;
		var duration = req.body.duration || 120;

		var timestamp = + new Date();
		var execTest = `/home/ubuntu/apache-jmeter-5.1.1/bin/jmeter -n -t /home/ubuntu/jmx_scenarios/AutomatedTest.jmx   -JReportName=/home/ubuntu/jmeterapi/csv/r${timestamp} -JUsersPool=/home/ubuntu/jmx_scenarios/users_pool.csv -JThreads=${threads} -JRampUp=${ramp} -JDuration=${duration}`;
		var genReport = `/home/ubuntu/apache-jmeter-5.1.1/bin/jmeter -g /home/ubuntu/jmeterapi/csv/r${timestamp}.csv -o /home/ubuntu/jmeterapi/reports/r${timestamp}`;
		var shell = require('./shellHelper');
		shell.series([
			execTest, genReport
		], function(err){
		});
		res.send(`Report will be ready within ${duration} seconds. Check at http://:8001/r${timestamp}/index.html`)
	  });

	app.get('/reports/list', (req, res) => {
		const { readdirSync, statSync } = require('fs');
		const { join } = require('path');
		const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
		var dirsList = dirs(`/home/ubuntu/jmeterapi/reports`);
		for (index = 0; index < dirsList.length; ++index) {
			dirsList[index] = `http://:8001/${dirsList[index]}/index.html`;
		}
		res.send(dirsList);
	});

};

