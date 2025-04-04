import jwt from 'jsonwebtoken';

export const createToken = ({ id, phone }) => {
  return jwt.sign(
    { id, phone },
    process.env.JWT_SECRET,
    { expiresIn: '1d' } // срок действия токена (1 День)
  );
};