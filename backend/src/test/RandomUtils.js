const randomstring = require("randomstring");

class RandomUtils {
  static randomString(length) {
    return randomstring.generate(length);
  }

  static randomNumber(digits) {
    digits = digits ? digits : 8;
    return Math.floor(Math.random() * Math.pow(10, digits));
  }

  static randomEmail() {
    return `${RandomUtils.randomString(6)}.${Date.now()}@${RandomUtils.randomString(6)}.com`;
  }
}

module.exports = RandomUtils;