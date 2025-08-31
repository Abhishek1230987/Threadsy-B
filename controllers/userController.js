import mongoose from 'mongoose';
import userModel from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Token creator for users
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Token creator for admin
const createAdminToken = (email) => {
  return jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Route: POST /api/user/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trim whitespace and convert email to lowercase for consistency
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Login attempt for email:', trimmedEmail);

    const user = await userModel.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('User not found for email:', trimmedEmail);
      return res.json({ success: false, message: 'User does not exist' });
    }

    console.log('User found, comparing passwords...');
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      console.log('Login successful for email:', trimmedEmail);
      return res.status(200).json({ success: true, user, token });
    } else {
      console.log('Password mismatch for email:', trimmedEmail);
      return res.json({ success: false, message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Route: POST /api/user/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Trim whitespace and convert email to lowercase for consistency
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    console.log('Registration attempt for email:', trimmedEmail);

    const exists = await userModel.findOne({ email: trimmedEmail });
    if (exists) {
      console.log('User already exists for email:', trimmedEmail);
      return res.json({ success: false, message: 'User already exists' });
    }

    if (!validator.isEmail(trimmedEmail)) {
      return res.json({ success: false, message: 'Please enter a valid email address' });
    }

    if (trimmedPassword.length < 8 || !validator.isStrongPassword(trimmedPassword)) {
      return res.json({
        success: false,
        message: 'Password must be at least 8 characters long and include a mix of letters, numbers, and symbols'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

    const newUser = new userModel({ 
      name: trimmedName, 
      email: trimmedEmail, 
      password: hashedPassword 
    });
    const user = await newUser.save();

    console.log('User registered successfully for email:', trimmedEmail);

    const token = createToken(user._id);

    res.status(201).json({ success: true, user, token });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Route: POST /api/users/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.Admin_EMAIL && password === process.env.Admin_PASSWORD) {
      const token = createAdminToken(email);
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { loginUser, registerUser, adminLogin };
