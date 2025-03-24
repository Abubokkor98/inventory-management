// src/auth/constants.ts
export const jwtConstants = {
    secret: process.env.JWT_SECRET, // Use environment variable or fallback
    expiresIn: '1h',
  };