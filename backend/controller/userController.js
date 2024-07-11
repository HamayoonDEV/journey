import Joi from "joi";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import JwtServices from "../services/JwtServices.js";
import RefreshToken from "../models/token.js";

const passwordPattren =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;

const userController = {
  async createUser(req, res, next) {
    const createUserSchema = Joi.object({
      name: Joi.string().max(30).required(),
      username: Joi.string().min(5).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattren).required(),
      confirmPassword: Joi.string().required(),
    });
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { name, username, email, password, confirmPassword } = req.body;
    //handle doublicate username and email **account creation**
    let user;
    try {
      const usernameInUse = await User.exists({ username });
      const emailInUse = await User.exists({ email });
      //username exists
      if (usernameInUse) {
        const error = {
          status: 401,
          message: "username is already in use!",
        };
        return next(error);
      }
      //email exists
      if (emailInUse) {
        const error = {
          status: 401,
          message: "email is already in use!",
        };
        return next(error);
      }
      //compare password with confrimPassword
      if (confirmPassword != password) {
        const error = {
          status: 401,
          message: "MisMatch password!",
        };
        return next(error);
      }
      //password hasing
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const createNewUser = new User({
          name,
          username,
          email,
          password: hashedPassword,
        });
        user = await createNewUser.save();
      } catch (error) {
        return next(error);
      }
    } catch (error) {
      return error;
    }
    //genrating jwt tokens
    const accessToken = JwtServices.signAccessToken({ _id: user._id }, "1m");
    const refreshToken = JwtServices.signRefreshToken({ _id: user._id });
    //save refreshtoken to the database
    await JwtServices.storeRefreshToken(refreshToken, user._id);
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //sending response
    res.status(201).json({ user, auth: true });
  },
  //login method
  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattren).required(),
    });
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { username, password } = req.body;
    let user;
    try {
      //finding user in the database
      user = await User.findOne({ username });
      if (!user) {
        const error = {
          status: 401,
          message: "invalid username!",
        };
        return next(error);
      }
      //matching password with database
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "invalid password!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //genrate tokens
    const accessToken = JwtServices.signAccessToken({ _id: user._id }, "1m");
    const refreshToken = JwtServices.signRefreshToken({ _id: user._id });
    //update refreshtoken to the databaes
    try {
      await RefreshToken.updateOne(
        { _id: user._id },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    //sending tokens to the cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    //sending response
    res.status(200).json({ user, auth: true });
  },

  //logout method
  async logout(req, res, next) {
    const { refreshToken } = req.cookies;

    try {
      //deleting refreshtoken from databaes
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    //clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //sending response
    res.status(200).json({ user: null, auth: false });
  },
  //refreshToken method
  async refreshToken(req, res, next) {
    const orignalRefreshToken = req.cookies.refreshToken;
    //verify refreshToken
    let id;
    try {
      id = await JwtServices.verifyRefreshToken(orignalRefreshToken)._id;
      const match = await RefreshToken.findOne({
        _id: id,
        token: orignalRefreshToken,
      });
      if (!match) {
        const error = {
          status: 401,
          message: "MisMatched RefreshToken!",
        };
        return next(error);
      }
      //genrate new token
      const accessToken = JwtServices.signAccessToken({ _id: id }, "1m");
      const refreshToken = JwtServices.signRefreshToken({ _id: id });
      //sending tokens to the cookies
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      //update the refreshToken to the database
      try {
        await RefreshToken.updateOne({ _id: id }, { token: refreshToken });
      } catch (error) {
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    //sending response
    const user = await User.findOne({ _id: id });
    res.status(200).json({ user, auth: true });
  },
};

export default userController;
