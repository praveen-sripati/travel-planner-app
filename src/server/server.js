// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Require Express to run server and routes
const express = require('express');
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "YOUR_APP_ID",
  application_key: "YOUR_APP_KEY"
});

textapi.sentiment({
  'text': 'John is a very good football player!'
}, function(error, response) {
  if (error === null) {
    console.log(response);
  }
});

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
app.use(express.static('website'));

// Setup Server
const port = 8000;

const server = app.listen(port, listening);

function listening() {
  console.log('server is running...')
  console.log(`port is ${port}`);
}

//Get route
const allData = []

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
    temp: req.body.temp,
    date: req.body.date,
    condition: req.body.condition,
    userResponse: req.body.userResponse
  };

  allData.unshift(projectData);
  // console.log(projectData);
}