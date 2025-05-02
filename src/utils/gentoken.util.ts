import * as dotenv from 'dotenv';
dotenv.config();

import * as jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const genToken = (userId: number, email: string, expiresIn?: number): string => {
  const payload = { userId, email };
  const token = jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: expiresIn || '1h',
  });
  return token;
};

export { genToken };
