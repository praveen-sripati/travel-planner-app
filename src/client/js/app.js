// Personal API Key for OpenWeatherMap API
import {config} from '../../../config';
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

const baseUrl = "http://api.geonames.org/searchJSON?q=";
const USER_NAME = "&username="+config.USER_NAME;
const maxRows = "&maxRows=1";
const darkSkyBaseURL = "https://api.darksky.net/forecast/";
const darkSkyAPI_KEY = config.darkskyAPI_KEY;
const pixabayBaseURL = "https://pixabay.com/api/?key=";
const pixabayAPI_KEY = config.pixabayAPI_KEY;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Function called by event listener */
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

/*Days Countdown*/
function daysCountdown(dateValue, currentDate) {
  const oneDayInMs = 1000*60*60*24;
  const diffInMs = dateValue.getTime() - currentDate.getTime();  return Math.floor(diffInMs/oneDayInMs);
}

/* Function to GET Geonames Web API Data*/
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

/*Function to Darksky Web API Data */
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

/* Function to POST data */
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

/* Function to GET Project Data */
const updateUI = async () => {
  const res = await fetch('/all');
  try {
    const allData = await res.json();
    recentEntry(allData);
    // if(allData.length > 1) {
    //   previousEntry(allData);
    // }
  } catch(error) {
    console.log("error", error);
    alert("Something went wrong!");
  }
}

function importAll(r) {
  return r.keys().map(r);
}

const images = importAll(require.context('./', false, /\.(png|jpe?g|svg)$/));


function recentEntry(allData) {

  document.getElementsByClassName('trip-container')[0].style.backgroundColor = "#E27429";

  document.getElementsByClassName('place')[0].innerHTML = `My trip to: ${allData[0].city}, ${allData[0].country}`;

  document.getElementsByClassName('departing')[0].innerHTML = `Departing: ${allData[0].depart}`;

  if (allData[0].daysCount > 0) {
    document.getElementsByClassName('days-count')[0].innerHTML = `${allData[0].city}, ${allData[0].country} is ${allData[0].daysCount} day(s) away`;
  } else {
    document.getElementsByClassName('days-count')[0].innerHTML = '';
  }

  document.getElementsByClassName('typical-weather-title')[0].innerHTML = `Typical weather for then is:`;

  document.getElementsByClassName('temp-high')[0].innerHTML = `High: ${allData[0].tempHigh} °C`;

  document.getElementsByClassName('temp-low')[0].innerHTML = `Low: ${allData[0].tempLow} °C`;

  if(allData[0].summary !== undefined) {
    document.getElementsByClassName('summary')[0].innerHTML = allData[0].summary;
  }

  if(allData[0].imageURL !== undefined) {
    const image = document.getElementById('image-location')
    image.setAttribute('src',allData[0].imageURL)
    image.setAttribute('width','100%');
    image.style.boxShadow = "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
  } else {
    document.getElementsByClassName('trip-image')[0].innerHTML = `image of the location`;
  }

  const icon = document.getElementById('weather-icon');
  switch(allData[0].icon) {
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


// function previousEntry(allData) {
//   document.getElementById('prevEntry').style.cssText = "margin-top:1rem; padding: 1rem;";
//   document.getElementById('prevCity').innerHTML = allData[1].city;
//   document.getElementById('prevDate').innerHTML = allData[1].date;
//   document.getElementById('prevTemp').innerHTML = `${allData[1].temp}°C ${allData[1].condition}`;
//   document.getElementById('prevContent').innerHTML =  "\""+allData[1].userResponse+"\"";
// }