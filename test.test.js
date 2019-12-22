const { getData } = require('./src/http');
test('Expected response has property "bars"', () => {
  expect.assertions(1);
  return expect(getData()).resolves.toHaveProperty("bars")
});
test('Expected response has property "buttons"', () => {
  expect.assertions(1);
  return expect(getData()).resolves.toHaveProperty("buttons")
});
test('Expected response has property "limit"', () => {
  expect.assertions(1);
  return expect(getData()).resolves.toHaveProperty("limit")
});