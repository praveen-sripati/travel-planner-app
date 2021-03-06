// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Require Express to run server and routes
const express = require('express');
const request = require('request')

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Access-Control-Allow-Origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Cors for cross origin allowance
const cors = require('Cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));


//Get route
app.get('/', function (req, res) {
  res.sendFile('dist/index.html')
})

app.get('/getProjectData', getProjectData);

function getProjectData(req, res) {
  console.log(projectData);
  res.send(projectData);
}

app.post('/weather', getWeather);

// proxy post request to darkskyAPI
function getWeather(req, res) {
  request(
    { url: req.body.url },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        console.log(error.message);
        return res.status(500).json({ type: 'error', message: error.message });
      }
      res.json(JSON.parse(body));
    }
  )
}

//Post route
app.post('/addProjectData', addProjectData);

function addProjectData(req, res) {

  projectData = {
    city: req.body.city,
    country:req.body.country,
    depart: req.body.depart,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
    daysCount: req.body.daysCount,
    tempHigh: req.body.tempHigh,
    tempLow: req.body.tempLow,
    summary: req.body.summary,
    imageURL: req.body.imageURL,
    icon: req.body.icon
  }

}

//POST Route
const allData = []

app.post('/saveData', saveData);

function saveData(req, res) {
  allData.unshift(projectData);
}

module.exports = app