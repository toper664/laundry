const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sequelize = require('../etc/models/DBModel');
const defineUser = require('../etc/models/UserModel');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv();
const User = defineUser(sequelize);

addFormats(ajv);

const encryptPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const generateAccessToken = (username, userId) =>
  jwt.sign({ username, userId }, 'your-secret-key', { expiresIn: '24h' });

const schema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: { type: 'string', minLength: 3 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 }
  }
};

const validate = ajv.compile(schema);

exports.register = async (req, res) => {
  try {
    if (!validate(req.body)) {
        return res.status(400).json({ error: 'Invalid input', details: validate.errors });
    }
    const { username, email, password } = req.body;
    const encryptedPassword = encryptPassword(password);
    const user = await User.create({
      username,
      email,
      password: encryptedPassword
    });
    const accessToken = generateAccessToken(username, user.id);
    res.status(201).json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
      token: accessToken
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const encrypted = encryptPassword(password);
  const user = await User.findOne({ where: { username } });

  if (!user || user.password !== encrypted)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateAccessToken(username, user.id);
  res.json({ success: true, user, token });
};