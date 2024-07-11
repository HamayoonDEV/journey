import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_STRING, REFRESH_TOKEN_STRING } from "../config/index.js";
import RefreshToken from "../models/token.js";

class JwtServices {
  //signAccessToken
  static signAccessToken(payload, expriytime) {
    return jwt.sign(payload, ACCESS_TOKEN_STRING, { expiresIn: expriytime });
  }
  //signRefreshToken
  static signRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_STRING);
  }
  //verifyAccessToken
  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_STRING);
  }
  //verifyRefreshToken
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_STRING);
  }
  //storeRefreshToken
  static async storeRefreshToken(token, userId) {
    const newToken = new RefreshToken({
      token,
      userId,
    });
    await newToken.save();
  }
}

export default JwtServices;
