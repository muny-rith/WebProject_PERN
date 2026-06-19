import bcrypt from "bcryptjs";
import * as userModel from "./user.model.js";
import { signToken } from "../../shared/utils/jwtToken.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Register a new user profile.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return next(
        new ApiError(400, "Please provide name, email and password."),
      );
    }

    if (password.length < 6) {
      return next(
        new ApiError(400, "Password must be at least 6 characters long."),
      );
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user. Note: We restrict role creation to customer by default unless specified (or handled securely)
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "customer", // Allow direct admin seeding for demonstration simplicity
    });

    // Sign JWT
    const token = signToken({ id: newUser.id, role: newUser.role });

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in a user.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Please provide email and password."));
    }

    // Fetch user and check hashed password
    const user = await userModel.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new ApiError(401, "Incorrect email or password."));
    }

    // Sign token
    const token = signToken({ id: user.id, role: user.role });

    // Remove password from response
    delete user.password;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch authenticated user details.
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user details.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return next(new ApiError(400, "Name and email are required."));
    }

    const updatedUser = await userModel.updateProfile(req.user.id, { name, email });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};
