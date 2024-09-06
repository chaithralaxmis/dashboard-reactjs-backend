const jwt = require("jsonwebtoken");
const tokenGenerator = (id) => {
  console.log(process.env.SECRATE_KEY);

  return jwt.sign(id, process.env.SECRATE_KEY, { expiresIn: "1d" });
};

module.exports = { tokenGenerator };
