const newman = require('newman');
const fs = require('fs');
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${appRoot}/newman/settings`)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer(({ 
	storage: storage
	}))

module.exports = function(app) {

	function showDirContents(relativePath){
		const { readdirSync, statSync } = require('fs');
		const { join } = require('path');
		const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
		var dirsList = dirs(`${appRoot}/${relativePath}`);
		for (index = 0; index < dirsList.length; ++index) {
			dirsList[index] = `${serverExternalURL}/${dirsList[index]}/index.html`;
		}
		return dirsList;
	}
	
	app.get('/', (req, res) => {
		res.sendFile(`${appRoot}/app/index.html`);
	  });

	app.get('/ok', (req, res) => {
		res.sendStatus(200)
	  });

	app.get('/report', (req, res) => {
		var threads = 100;
		var ramp = 60;
		var duration = 120;

		var timestamp = + new Date();
		var execTest = `${jmeterPath} -n -t ${jmeterScenarios}/AutomatedTest.jmx   -JReportName=${appRoot}/csv/r${timestamp} -JUsersPool=${jmeterScenarios}/users_pool.csv -JThreads=${threads} -JRampUp=${ramp} -JDuration=${duration}`;
		var genReport = `${jmeterPath} -g ${appRoot}/csv/r${timestamp}.csv -o ${appRoot}/reports/r${timestamp}`;
		var shell = require('./shellHelper');
		shell.series([
			execTest, genReport
		], function(err){
		});
		res.send(`Report will be ready within ${duration} seconds. Check at ${serverExternalURL}/r${timestamp}/index.html`)
	  });

	app.post('/report', (req, res) => {
		console.log(req);
		var threads = req.body.threads || 100;
		var ramp = req.body.ramp || 60;
		var duration = req.body.duration || 120;

		var timestamp = + new Date();
		var execTest = `${jmeterPath} -n -t ${jmeterScenarios}/AutomatedTest.jmx   -JReportName=${appRoot}/csv/r${timestamp} -JUsersPool=${jmeterScenarios}/users_pool.csv -JThreads=${threads} -JRampUp=${ramp} -JDuration=${duration}`;
		var genReport = `${jmeterPath} -g ${appRoot}/csv/r${timestamp}.csv -o ${appRoot}/reports/r${timestamp}`;
		var shell = require('./shellHelper');
		shell.series([
			execTest, genReport
		], function(err){
		});
		res.send(`Report will be ready within ${duration} seconds. Check at ${serverExternalURL}/r${timestamp}/index.html`)
	  });

	app.get('/reports/list', (req, res) => {
		var dirsList = showDirContents("reports");
		res.send(dirsList);
	});

	app.get('/newman', (req, res) => {
		res.sendFile(`${appRoot}/newman/reports/htmlResults.html`);
	  });
	  
	app.get('/newman/report', (req, res) => {
		var report = `${appRoot}/newman/reports/htmlResults.html`;
		if (fs.existsSync(report)) {
			console.log(`clearing ${report}`);
			fs.unlinkSync(report);
		}
		var collectionName = req.query.colleciton || 'Fx1.postman_collection.json';
		var environment = req.query.env || 'Test.postman_environment.json';
		
		console.log(`$newman run ${appRoot}/newman/settings/${collectionName} -e ${appRoot}/newman/settings/${environment} -r html`);
		newman.run({
			collection: require(`${appRoot}/newman/settings/${collectionName}`),
			environment: require(`${appRoot}/newman/settings/${environment}`),
			insecure: true,
			reporters: 'html',
			reporter: {
				html: {
					export: `${appRoot}/newman/reports/htmlResults.html`
					//,template: './customTemplate.hbs' // optional, this will be picked up relative to the directory that Newman runs in.
				}
			}
		}, function (err) {
			if (err) { 
					console.log(`Error: ${err}`);
					throw err; 
				}
			console.log('Collection run success');
			res.sendFile(`${appRoot}/newman/reports/htmlResults.html`)
		});
	  });
	  
	
	app.get('/newman/upload', (req, res) => {
		res.sendFile(`${appRoot}/app/newman_upload.html`);
	  });
	
	app.post('/newman/upload/all', upload.array('collection'), function (req, res, next) {
		//console.log(req.files)
		//var result = req.files.map(c => " " + c.originalname );
		res.send(`Files uploaded: `);
	});
	
	app.get('/newman/settings/list', (req, res) => {
		var dirsList = showDirContents("newman/settings");
		res.send(`Contents of newman/settings: ${dirsList}`);
	  });
	  
	app.post('/newman/collection', (req, res) => {
		var collectionJson = JSON.parse(req.body.collectionJson);
		res.send(`${appRoot}/newman/settings/Fx1.postman_collection.json was updated`)
	  });
	  
	app.post('/newman/environment', (req, res) => {
		var key = req.body.key;
		var environmentJson = JSON.parse(req.body.environmentJson);
		res.send(`${appRoot}/newman/settings/Fx1.postman_collection.json was updated`)
	  });
};

