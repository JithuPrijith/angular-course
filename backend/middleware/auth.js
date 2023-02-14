const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log(req.headers["authorization"]);
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "this is super key");
    next();
  } catch (error) {
    res.status(401).json({ message: "authorization failed" });
  }
};
