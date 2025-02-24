import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token expired or invalid" });
  }
};
