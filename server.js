const express        = require('express');
const bodyParser     = require('body-parser');
const app            = express();
const port = 8001;

//set global app root path
var path = require('path');
global.appRoot = path.resolve(__dirname);
global.jmeterPath = '/home/ubuntu/apache-jmeter-5.1.1/bin/jmeter';
global.jmeterScenarios = '/home/ubuntu/jmx_scenarios';
global.serverExternalURL = `http://:${port}`;

var fs = require('fs');

var dir = `${appRoot}/newman`;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
dir = `${appRoot}/newman/settings`;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
dir = `${appRoot}/newman/reports`;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
dir = `${appRoot}/reports`;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
dir = `${appRoot}/csv`;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('reports'))
app.use(express.static('newman/reports'))
app.use(express.static('csv'))

require('./app/routes')(app);
app.listen(port, () => {
  console.log('Listening on ' + port);
});

