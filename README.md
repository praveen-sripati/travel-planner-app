# Travel Planner

Travel Planner is a travel planning application that gives weather details of the location that the user is traveling at a particular date.

## Tech

This project uses a number of open source projects to work properly:

- **Node.js** - JavaScript runtime environment that executes JavaScript code outside of a browser
- **Express** - Fast node.js network app framework
- **Webpack** - JavaScript module bundler
- **Jest** - Delightful JavaScript testing framework
- **API's Used** - Geonames API for coordinates, Darksky API for weather details and Pixabay API for Images
- **Weather Icons** - Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)


## Installation

`cd` into your new folder and run:
- `npm install`
- Create an account with `Geonames` for an API key
- Create an account with `Darksky` for an API key
- Create an account with `Pixabay` for an API key
- Create a config.js in the root directory to save API keys

Here is an example of config.js:
```
    export var config = {

      pixabayAPI_KEY: '148*****************************',
      darkskyAPI_KEY: '509*****************************',
      USER_NAME: '************' //Geonames API Key

    }
```

## Run

- For Developer Mode - `npm run build-dev`
- For Production Mode - `npm run build-prod`
- To start the server you should run `npm run start` command in CLI
- The server should start on your browser on port [8000]('http://localhost:8000/')
- To test the project use the following command: `npm run test`

Please make sure to update tests as appropriate.

## License
[MIT](LICENSE)