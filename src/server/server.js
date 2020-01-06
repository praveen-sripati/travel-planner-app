// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Require Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('Cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

// Setup Server
const port = 8000;

const server = app.listen(port, listening);

function listening() {
  console.log('server is running...')
  console.log(`port is ${port}`);
}

//Get route
const allData = []

app.get('/', function (req, res) {
  res.sendFile('dist/index.html')
})

app.get('/all', getProjectData);

function getProjectData(req, res) {
  console.log(allData);
  res.send(allData);
}

//Post route
app.post('/addProjectData', addProjectData);

function addProjectData(req, res) {

  projectData = {
    city: req.body.city,
    depart: req.body.depart,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
  };

  allData.unshift(projectData);
  // console.log(projectData);
}