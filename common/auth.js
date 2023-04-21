const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const secretkey = "Abvuy@^%42vusjYT@#";

//hashingh password
const saltRounds = 10;
const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(saltRounds);
  let hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

//comparing hashed password for login
const hashCompare = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// token for expiry of details in local storage
const createToken = async (payload) => {
  let token = await jwt.sign(payload, process.env.secretkey, {
    expiresIn: "2m",
  });
  return token;
};

const validate = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1];
    let data = await jwt.decode(token);

    if (Math.floor(+new Date() / 1000) < data.exp) {
      next();
    } else {
      res.status(401).send({ message: "Token Expired" });
    }
  } else {
    res.status(400).send({ message: " Token Not Found" });
  }
};

module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  validate,
};
