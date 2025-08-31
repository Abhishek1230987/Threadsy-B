import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const adminAuth = (req, res, next) => {
  try {
    // Check for token in both Authorization header and custom token header
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;
    console.log("Token received:", token ? "[TOKEN_PRESENT]" : "[NO_TOKEN]");
    
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", { email: decoded.email, role: decoded.role });
    console.log("Expected admin email:", process.env.Admin_EMAIL);

    if (decoded.email !== process.env.Admin_EMAIL || decoded.role !== "admin") {
      console.log("Admin validation failed:", {
        emailMatch: decoded.email === process.env.Admin_EMAIL,
        roleMatch: decoded.role === "admin",
        decodedEmail: decoded.email,
        decodedRole: decoded.role
      });
      return res
        .status(403)
        .json({ success: false, message: "Forbidden - Not admin" });
    }

    req.user = decoded; // store decoded token in request if needed
    next();
  } catch (error) {
    console.error("Error in adminAuth middleware:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default adminAuth;
