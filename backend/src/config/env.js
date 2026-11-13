import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: '8h',
};

if (!env.jwtSecret) {
  throw new Error('Falta JWT_SECRET en backend/.env');
}