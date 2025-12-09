import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import connectDB from '../db.js';

export async function authMiddleware(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return { error: { status: 401, message: 'No token provided' } };
    }

    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password').lean();

    if (!admin) {
      return { error: { status: 401, message: 'Invalid token' } };
    }

    return { admin };
  } catch (error) {
    return { error: { status: 401, message: 'Authentication failed' } };
  }
}

