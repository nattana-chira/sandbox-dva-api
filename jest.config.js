/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  resetMocks: false,
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};