import JwtServices from "../services/JwtServices.js";
import User from "../models/user.js";

const auth = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken || !refreshToken) {
    const error = {
      message: "user UnAuthorised!",
    };
    return next(error);
  }
  //verify accessToken by database userId
  let id;
  let user;
  try {
    id = await JwtServices.verifyAccessToken(accessToken)._id;
    if (!id) {
      const error = {
        status: 404,
        message: "id not found!",
      };
      return next(error);
    }
    user = await User.findOne({ _id: id });
    if (!user) {
      const error = {
        status: 404,
        message: "user not found!",
      };
      return next(error);
    }
  } catch (error) {
    return error;
  }
  req.user = user;
  next();
};

export default auth;
