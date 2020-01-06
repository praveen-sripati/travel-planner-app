// Personal API Key for OpenWeatherMap API

let baseUrl = "http://api.geonames.org/searchJSON?q=";
const USER_NAME = "&username=praveen_sripati";
const maxRows = "&maxRows=1";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Function called by event listener */
export function performAction(e) {
  const City = document.getElementById('city').value;
  const date = document.getElementById('date').value;
  const dateValue = new Date(date);
  const currentDate = new Date();

  const daysCount = daysCountdown(dateValue, currentDate);
  const newDate = months[dateValue.getMonth()]+' '+ dateValue.getDate()+' '+ dateValue.getFullYear();

  getCoordinates(baseUrl, City, maxRows, USER_NAME)
  .then((data) => {
    postData('/addProjectData', {
      city: data.geonames[0].toponymName,
      depart: newDate,
      longitude: data.geonames[0].lng,
      latitude: data.geonames[0].lat
    });
    updateUI();
  })
}

/*Days Countdown*/
function daysCountdown(dateValue, currentDate) {
  const oneDayInMs = 1000*60*60*24;
  const diffInMs = dateValue.getTime() - currentDate.getTime();  return Math.floor(diffInMs/oneDayInMs);
}

/* Function to GET Web API Data*/
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
    // alert("Zipcode or city no found!");
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
    if(allData.length > 1) {
      previousEntry(allData);
    }
  } catch(error) {
    console.log("error", error);
    alert("Something went wrong!");
  }
}

function recentEntry(allData) {
  // document.querySelector('.trip-details').style.cssText = "margin-top:1rem; padding: 1rem;";
  document.getElementsByClassName('place')[0].innerHTML = allData[0].city;
  document.getElementsByClassName('departing')[0].innerHTML = allData[0].depart;
  document.getElementsByClassName('longitude')[0].innerHTML = allData[0].longitude;
  document.getElementsByClassName('latitude')[0].innerHTML = allData[0].latitude;
}

function previousEntry(allData) {
  document.getElementById('prevEntry').style.cssText = "margin-top:1rem; padding: 1rem;";
  document.getElementById('prevCity').innerHTML = allData[1].city;
  document.getElementById('prevDate').innerHTML = allData[1].date;
  document.getElementById('prevTemp').innerHTML = `${allData[1].temp}°C ${allData[1].condition}`;
  document.getElementById('prevContent').innerHTML =  "\""+allData[1].userResponse+"\"";
}