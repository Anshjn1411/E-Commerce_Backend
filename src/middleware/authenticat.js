const jwtProvider=require("../config/jwtProvider")
const userService=require("../services/user.service")


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      authHeader.split(" ")[1] === "null" ||
      authHeader.split(" ")[1] === "undefined"
    ) {
      return res.status(401).send({ message: "Invalid or missing token" });
    }

    const token = authHeader.split(" ")[1];
    const userId = jwtProvider.getUserIdFromToken(token);
    const user = await userService.findUserById(userId);

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};


module.exports=authenticate;