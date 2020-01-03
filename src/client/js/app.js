// Personal API Key for OpenWeatherMap API
let baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
const APIkey = "&appid=113134aff3ecf62594b59dce3068d92e";
const celciusUnit = "&units=metric";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let d = new Date();
let newDate = months[d.getMonth()]+' '+ d.getDate()+' '+ d.getFullYear();

// Event listener to add function to existing HTML DOM element
document.getElementById('generate').addEventListener('click', performAction);

/* Function called by event listener */
function performAction(e) {
  const zipOrCity = document.getElementById('zip').value;
  if (typeof(zipOrCity) === "number") {
    baseUrl = "https://api.openweathermap.org/data/2.5/weather?zip=";
  } else {
    baseUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
  }
  const userResponse = document.getElementById('feelings').value;

  getWeather(baseUrl, zipOrCity, celciusUnit, APIkey)
  .then((data) => {
    postData('/addProjectData', {city:data.name, temp:data.main.temp, date:newDate, condition: data.weather[0].main, userResponse: userResponse});
    updateUI();
  })
}

/* Function to GET Web API Data*/
const getWeather = async (baseUrl, zipOrCity, celciusUnit, APIkey) => {
  const res = await fetch(baseUrl+zipOrCity+celciusUnit+APIkey)
  try {
    const data = await res.json();
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
  document.querySelector('.entryHolder').style.cssText = "margin-top:1rem; padding: 1rem;";
  document.getElementById('city').innerHTML = allData[0].city;
  document.getElementById('date').innerHTML = allData[0].date;
  document.getElementById('temp').innerHTML = `${allData[0].temp}°C ${allData[0].condition}`;
  document.getElementById('content').innerHTML = "\""+allData[0].userResponse+"\"";
}

function previousEntry(allData) {
  document.getElementById('prevEntry').style.cssText = "margin-top:1rem; padding: 1rem;";
  document.getElementById('prevCity').innerHTML = allData[1].city;
  document.getElementById('prevDate').innerHTML = allData[1].date;
  document.getElementById('prevTemp').innerHTML = `${allData[1].temp}°C ${allData[1].condition}`;
  document.getElementById('prevContent').innerHTML =  "\""+allData[1].userResponse+"\"";

}