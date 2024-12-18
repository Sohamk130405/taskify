const jwt = require("jsonwebtoken");

module.exports.generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, "gdubg8v4y8ccshiu398", {
    expiresIn: "15d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  return token;
};
