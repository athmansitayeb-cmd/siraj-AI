import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ msg: "غير مصرح" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "رمز غير صالح" });
  }
}
