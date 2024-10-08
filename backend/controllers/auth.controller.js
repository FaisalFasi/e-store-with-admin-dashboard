import redis from "../db/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};

const storeRefreshTokenIn_redis_db = async (userId, refreshToken) => {
  // store the refresh token in the database
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevents JS from reading the cookie data & cross-site scripting attacks
    // sameSite: "none",
    sameSite: "strict", // prevents CSRF attacks
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevents JS from reading the cookie data & cross-site scripting attacks
    // sameSite: "none",
    sameSite: "strict", // prevents CSRF attacks
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
export const signup = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create user
    const newUser = await User.create({ email, password, name });

    // authenticate user
    const { accessToken, refreshToken } = generateToken(newUser._id);
    await storeRefreshTokenIn_redis_db(newUser._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    console.log("Cookies set:", res.getHeaders()["set-cookie"]);

    // remove the password from the user data
    // send response to the client with the user data without the password
    res.send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.log(error);
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id);

      await storeRefreshTokenIn_redis_db(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error while login", error });
  }
};

export const logout = async (req, res) => {
  try {
    // get the refresh token from the cookies
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET
      );
      // delete the refresh token from the database
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    // clear the cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error while logout:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error while logout", error });
  }
};

// this controller is used to refresh the access token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    console.log("refreshToken:", refreshToken);

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: " No refresh token provided! please login" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Refreshed token successfully" });
  } catch (error) {
    console.log("error in refresh token controller:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error while refreshing token", error });
  }
};

// export const getProfile = async (req, res) => {};