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

  //gets user input values
  const userCity = document.getElementById('city').value;
  const date = document.getElementById('date').value;

  //checks whether fields are filled or not
  if (userCity === '' || date === '') {
    alert("Please fill out all the fields");
    return;
  }

  //converts user input date value into Date data type
  const dateValue = new Date(date);
  const currentDate = new Date(); //defines current date

  //Pixabay query part of the API Endpoint
  const query = `&q=${userCity}&category=travel&orientation=horizontal&order=popular&page=1&per_page=3`

  //function call to find out days away to travel
  const daysCount = daysCountdown(dateValue, currentDate) + 1;
  const newDate = months[dateValue.getMonth()]+' '+ dateValue.getDate()+' '+ dateValue.getFullYear();// formats date into (MMM DD YYYY) format e.g Jun 12 2020

  //Performs promises in parallel
  Promise.all([
    getCoordinates(baseUrl, userCity, maxRows, USER_NAME),
    getImage(pixabayBaseURL, pixabayAPI_KEY, query)
  ])
  .then((data) => {
    const coordinates = "/" + data[0].geonames[0].lat + "," + data[0].geonames[0].lng;
    const time = "," + dateValue.toISOString().replace('.000Z','Z');
    const city = data[0].geonames[0].toponymName;
    const country = data[0].geonames[0].countryName;
    let imageURL = '';

    /* if the image of the city is present than it stores the city url
    * otherwise it will search the country image of the city and stores
    * it into url
    */
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

    // fetch the weather details using DarkSky API
    getWeather(darkSkyBaseURL, darkSkyAPI_KEY, coordinates, time)
    .then((weatherData) => {
      // the response data get posted to the local server
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

      //function call to update the UI
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
 * @param {*} userCity
 * @param {*} maxRows
 * @param {*} USER_NAME
 * @returns json response
 */
const getCoordinates = async (baseUrl, userCity, maxRows, USER_NAME) => {
  const res = await fetch(baseUrl+userCity+maxRows+USER_NAME)
  try {
    const data = await res.json();
    console.log(data);
    if (res.ok && data.geonames.length > 0) {
      return data;
    } else {
      throw new Error("Please enter a Valid city name");
    }
  } catch(error) {
    console.log("error",error);
    alert(error);
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
  //fetches weather data from local server
  const res = await fetch('/getProjectData');
  try {
    const projectData = await res.json();
    //function call to update UI
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
  //
  const icon = document.getElementById('weather-icon');

  /**
   * @description sets src and title attributes to icon element
   * @param {*} src
   * @param {*} title
   * @returns none
   */
  function setAttributes(src, title) {
    icon.setAttribute('src', src);
    icon.setAttribute('title', title);
  }


  switch(projectData.icon) {
    case 'clear-day':
      setAttributes(clearDay,'Clear Day');
      break;
    case 'clear-night':
      setAttributes(clearNight,'Clear Night');
      break;
    case 'rain':
      setAttributes(rain, 'Rain')
      break;
    case 'cloudy':
      setAttributes(cloudy,'Cloudy');
      break;
    case 'fog':
      setAttributes(fog,'Fog');
      break;
    case 'hail':
      setAttributes(hail,'Hail');
      break;
    case 'partly-cloudy-day':
      setAttributes(partlyCloudyDay,'Partly Cloudy Day');
      break;
    case 'partly-cloudy-night':
      setAttributes(partlyCloudyNight,'Partly Cloudy Night');
      break;
    case 'sleet':
      setAttributes(sleet,'Sleet');
      break;
    case 'snow':
      setAttributes(snow,'Snow');
      break;
    case 'thunderstorm':
      setAttributes(thunderstorm,'Thunderstorm');
      break;
    case 'tornado':
      setAttributes(tornado,'Tornado');
      break;
    case 'wind':
      setAttributes(wind,'Wind');
      break;
    default:
      if(icon.hasAttribute('src') && icon.hasAttribute('title')) {
        icon.removeAttribute('src');
        icon.removeAttribute('title');
      }
  }
}