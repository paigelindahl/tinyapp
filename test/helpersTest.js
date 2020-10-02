const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');
// const assert = chai.assert;

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });

  it('should return false when an invalid email is provided', function() {
    const user = getUserByEmail("testing@gmail.com", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });
  it('should return false since it does not return an object', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = false;
    assert.isNotObject(expectedOutput, user);
  });
  it('should return return false when passed an empty email string', function() {
    const user = getUserByEmail("", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });
});
