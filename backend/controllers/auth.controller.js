import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

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
    // save user

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ email, password, name });
    res.send({ message: "User created successfully", user });
  } catch (error) {
    console.log(error);
  }
};
export const login = (req, res) => {
  res.send("login route called!");
};
export const logout = (req, res) => {
  res.send("Hello World!");
};
