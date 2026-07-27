import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("============== AUTH ==============");
    console.log("Authorization Header:");
    console.log(req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("NO HEADER");
      return res.status(401).json({
        message: "No Authorization Header",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("BAD FORMAT");
      return res.status(401).json({
        message: "Bearer missing",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:");
    console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:");
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("AUTH SUCCESS");
    console.log("==============================");

    req.user = user;

    next();
  } catch (err) {
    console.log("AUTH ERROR");
    console.log(err);

    return res.status(401).json({
      message: err.message,
    });
  }
};

export default authMiddleware;