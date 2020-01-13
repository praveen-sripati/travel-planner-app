import '@babel/polyfill';
import { performAction } from './app'

describe("app tests", ()=> {

  test("performAction is a function", () => {
    expect(typeof(performAction)).toBe("function");
  });

})