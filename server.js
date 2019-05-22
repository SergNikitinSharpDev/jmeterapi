const express        = require('express');
const bodyParser     = require('body-parser');
const app            = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('reports'))
app.use(express.static('csv'))

require('./app/routes')(app);
const port = 8001;
app.listen(port, () => {
  console.log('Listening on ' + port);
});

