const request = require('supertest');
const app = require('../../server/server_app');

describe('Test the root path', () => {
  test('It should response the GET method', () => {
      return request(app).get("/").then(response => {
          expect(response.statusCode).toBe(200)
      })
  });
})

describe('Test the /getProjectData path', () => {
  test('It should response the GET method', () => {
      return request(app).get("/getProjectData").then(response => {
          expect(response.statusCode).toBe(200)
      })
  });
})