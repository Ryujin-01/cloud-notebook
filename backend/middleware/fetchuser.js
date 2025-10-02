const jwt = require("jsonwebtoken");
const JWT_SECRET = "ThisisthesignatureforJWTToken";

const fetchUser = (req, res, next) => {
  // Get the user from the jwt token and append id to req object

  const token = req.header("auth-token"); // req.header("auth-token") → looks into the HTTP request headers for a key named "auth-token".

  if (!token) {
    // If token mismatches
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET); // Verifies the token using JWT_SECRET
    req.user = data.user; // If the verification is true, return the payload i.e. the user data that we signed, the user.id
    next(); // Calls the next function
  } catch (error) {
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;
