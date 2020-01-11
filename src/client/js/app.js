//config file is used to store api secret keys
import {config} from '../../../config';

//Importing all SVG's of weather icons
import clearDay from '../media/weather-icons/clear-day.svg';
import clearNight from '../media/weather-icons/clear-night.svg';
import cloudy from '../media/weather-icons/clear-day.svg';
import fog from '../media/weather-icons/fog.svg'
import hail from '../media/weather-icons/hail.svg';
import partlyCloudyDay from '../media/weather-icons/partly-cloudy-day.svg';
import partlyCloudyNight from '../media/weather-icons/partly-cloudy-night.svg';
import rain from '../media/weather-icons/rain.svg';
import sleet from '../media/weather-icons/sleet.svg';
import snow from '../media/weather-icons/snow.svg'
import thunderstorm from '../media/weather-icons/thunderstorm.svg';
import tornado from '../media/weather-icons/tornado.svg';
import wind from '../media/weather-icons/wind.svg';

//Global variables
//geonames API Endpoint
const baseUrl = "http://api.geonames.org/searchJSON?q=";
const USER_NAME = "&username="+config.USER_NAME;
const maxRows = "&maxRows=1";

//DarkSky API Endpoint
const darkSkyBaseURL = "https://api.darksky.net/forecast/";
const darkSkyAPI_KEY = config.darkskyAPI_KEY;

//Pixabay API Endpoint
const pixabayBaseURL = "https://pixabay.com/api/?key=";
const pixabayAPI_KEY = config.pixabayAPI_KEY;

//Date months in 3 letters string form
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * @description Main function used to extract and display weather data
 * @param {*} e
 * @return none
 */
export function performAction(e) {
  const City = document.getElementById('city').value;
  const date = document.getElementById('date').value;
  const dateValue = new Date(date);
  const currentDate = new Date();
  const query = `&q=${City}&category=travel&orientation=horizontal&order=popular&page=1&per_page=3`

  const daysCount = daysCountdown(dateValue, currentDate) + 1;
  const newDate = months[dateValue.getMonth()]+' '+ dateValue.getDate()+' '+ dateValue.getFullYear();

  Promise.all([
    getCoordinates(baseUrl, City, maxRows, USER_NAME),
    getImage(pixabayBaseURL, pixabayAPI_KEY, query)
  ])
  .then((data) => {
    const coordinates = "/" + data[0].geonames[0].lat + "," + data[0].geonames[0].lng;
    const time = "," + dateValue.toISOString().replace('.000Z','Z');
    const city = data[0].geonames[0].toponymName;
    const country = data[0].geonames[0].countryName;
    let imageURL = '';

    if (data[1].hits.length !== 0) {
      imageURL = data[1].hits[0].webformatURL.replace('_640','_240');
    } else {
      const countryQuery = `&q=${country}&category=travel&orientation=horizontal&order=popular&page=1&per_page=3`
      getImage(pixabayBaseURL, pixabayAPI_KEY, countryQuery)
      .then((imageData)=>{
        imageURL = imageData.hits[0].webformatURL.replace('_640','_240');
        console.log(imageURL);
      })
    }

    getWeather(darkSkyBaseURL, darkSkyAPI_KEY, coordinates, time)
    .then((weatherData) => {
      postData('/addProjectData', {
        city: city,
        country: country,
        depart: newDate,
        longitude: weatherData.longitude,
        latitude: weatherData.latitude,
        daysCount: daysCount,
        tempHigh: Math.round((weatherData.daily.data[0].temperatureHigh-32)*5/9),
        tempLow: Math.round((weatherData.daily.data[0].temperatureLow-32)*5/9),
        summary: weatherData.daily.data[0].summary,
        imageURL: imageURL,
        icon: weatherData.daily.data[0].icon
      });
      updateUI();
    })
  })
}

/**
 * @description Evaluate number of days away to travel journey
 * @param {*} dateValue
 * @param {*} currentDate
 * @returns numbers of days away to travel
 */
function daysCountdown(dateValue, currentDate) {
  const oneDayInMs = 1000*60*60*24;
  const diffInMs = dateValue.getTime() - currentDate.getTime();
  return Math.floor(diffInMs/oneDayInMs);
}

/**
 * @description Function to GET Geonames Web API Data
 * @param {*} baseUrl
 * @param {*} City
 * @param {*} maxRows
 * @param {*} USER_NAME
 * @returns json response
 */
const getCoordinates = async (baseUrl, City, maxRows, USER_NAME) => {
  const res = await fetch(baseUrl+City+maxRows+USER_NAME)
  try {
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch(error) {
    console.log("error",error);
    alert(error.message);
  }
}

/**
 * @description Function to Darksky Web API Data
 * @param {*} darkSkyBaseURL
 * @param {*} darkSkyAPI_KEY
 * @param {*} coordinates
 * @param {*} time
 * @returns json response
 */
const getWeather = async (darkSkyBaseURL, darkSkyAPI_KEY, coordinates,time) => {
  const apiURL = darkSkyBaseURL+darkSkyAPI_KEY+coordinates+time;
  const res = await fetch('http://localhost:8000/weather', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'same-origin', // no-cors, *cors, same-origin
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({url: apiURL})
  });
  try {
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch(error) {
    console.log("error",error);
    alert(error.message);
  }
}

/**
 * @description Function to Darksky Web API Data
 * @param {*} pixabayBaseURL
 * @param {*} pixabayAPI_KEY
 * @param {*} query
 * @returns json response
 */
const getImage = async (pixabayBaseURL, pixabayAPI_KEY, query) => {
  const res = await fetch(pixabayBaseURL+pixabayAPI_KEY+query)
  try {
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch(error) {
    console.log("error",error);
    alert(error.message);
  }
}

/* Function to POST weather data */
const postData = async (url='', data={}) => {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  try {
    const newData = await res.json();
    return newData;
  } catch(error) {
    console.log("error", error);
    alert("Something went wrong!");
  }
}

/* Function to GET weather Data */
const updateUI = async () => {
  const res = await fetch('/getProjectData');
  try {
    const projectData = await res.json();
    recentEntry(projectData);
  } catch(error) {
    console.log("error", error);
    alert("Something went wrong!");
  }
}

/**
 * @description Update UI of the website
 * @param {*} projectData
 * @returns none
 */
function recentEntry(projectData) {

  console.log(projectData);

  //Sets background color of trip-container
  document.getElementsByClassName('trip-container')[0].style.backgroundColor = "#E27429";

  //Displays Weather details
  //trip location
  document.getElementsByClassName('place')[0].innerHTML = `My trip to: ${projectData.city}, ${projectData.country}`;

  //trip departing time
  document.getElementsByClassName('departing')[0].innerHTML = `Departing: ${projectData.depart}`;

  //Number of days away to travel
  if (projectData.daysCount > 0) {
    document.getElementsByClassName('days-count')[0].innerHTML = `${projectData.city}, ${projectData.country} is ${projectData.daysCount} day(s) away`;
  } else {
    document.getElementsByClassName('days-count')[0].innerHTML = '';
  }

  //typical weather title
  document.getElementsByClassName('typical-weather-title')[0].innerHTML = `Typical weather for then is:`;

  //High temperature
  document.getElementsByClassName('temp-high')[0].innerHTML = `High: ${projectData.tempHigh} °C`;

  //Low temperature
  document.getElementsByClassName('temp-low')[0].innerHTML = `Low: ${projectData.tempLow} °C`;

  //summary
  if(projectData.summary !== undefined) {
    document.getElementsByClassName('summary')[0].innerHTML = projectData.summary;
  }

  //Displays image of the location to travel
  if(projectData.imageURL !== undefined) {
    const image = document.getElementById('image-location')
    image.setAttribute('src',projectData.imageURL)
    image.setAttribute('width','100%');
    image.style.boxShadow = "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
  } else { //Displays below text if imageURL is not provided by the Pixabay API
    document.getElementsByClassName('trip-image')[0].innerHTML = `image of the location`;
  }

  //Displays weather icons (SVG's) if matches with Darksky API icon property
  const icon = document.getElementById('weather-icon');
  switch(projectData.icon) {
    case 'clear-day':
      icon.setAttribute('src', clearDay);
      icon.setAttribute('title','Clear Day');
      break;
    case 'clear-night':
      icon.setAttribute('src', clearNight)
      icon.setAttribute('title','Clear Night');
      break;
    case 'rain':
      icon.setAttribute('src', rain);
      icon.setAttribute('title','Rain');
      break;
    case 'cloudy':
      icon.setAttribute('src', cloudy);
      icon.setAttribute('title','Cloudy');
      break;
    case 'fog':
      icon.setAttribute('src', fog);
      icon.setAttribute('title','Fog');
      break;
    case 'hail':
      icon.setAttribute('src', hail);
      icon.setAttribute('title','Hail');
      break;
    case 'partly-cloudy-day':
      icon.setAttribute('src', partlyCloudyDay);
      icon.setAttribute('title','Partly Cloudy Day');
      break;
    case 'partly-cloudy-night':
      icon.setAttribute('src', partlyCloudyNight);
      icon.setAttribute('title','Partly Cloudy Night');
      break;
    case 'sleet':
      icon.setAttribute('src', sleet);
      icon.setAttribute('title','Sleet');
      break;
    case 'snow':
      icon.setAttribute('src', snow);
      icon.setAttribute('title','Snow');
      break;
    case 'thunderstorm':
      icon.setAttribute('src', thunderstorm);
      icon.setAttribute('title','Thunderstorm');
      break;
    case 'tornado':
      icon.setAttribute('src', tornado);
      icon.setAttribute('title','Tornado');
      break;
    case 'wind':
      icon.setAttribute('src', wind);
      icon.setAttribute('title','Wind');
      break;
    default:
      if(icon.hasAttribute('src') && icon.hasAttribute('title')) {
        icon.removeAttribute('src');
        icon.removeAttribute('title');
      }
  }
}