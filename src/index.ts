import express from 'express';
import bodyParser from 'body-parser';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Mock database
const users: { [key: string]: { firstName: string; email: string; password: string } } = {};
const posts: { [key: string]: { category: string; content: string } } = {};

// Middleware to validate JWT
const validateToken = (req: any, res: any, next: any) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'Authorization denied' });

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// Register user
app.post(
  '/api/signup',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, email, password } = req.body;

    if (users[email]) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    users[email] = { firstName, email, password: hashedPassword };

    const payload = {
      user: {
        email,
      },
    };

    jwt.sign(payload, 'secretkey', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  }
);

// Login user
app.post(
  '/api/signin',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!users[email]) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = bcrypt.compareSync(password, users[email].password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        email,
      },
    };

    jwt.sign(payload, 'secretkey', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  }
);

// Middleware to authenticate routes
app.use('/api/posts', validateToken);

// Submit post-it
app.post('/api/posts', (req, res) => {
  const { category, content } = req.body;
  const email = req.user.email;

  posts[email] = { category, content };

  res.json({ msg: 'Post-it submitted successfully' });
});

// Get all post-its
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
