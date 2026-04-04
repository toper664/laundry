const express = require('express');
const app = express();
const sequelize = require('./etc/models/DBModel');
const defineUser = require('./etc/models/UserModel');
const User = defineUser(sequelize);
const authRoutes = require('./auth/route');
const userRoutes = require('./users/route');

sequelize.sync();

app.use(express.json());
app.use('/', authRoutes);
app.use('/user', userRoutes);

app.get('/status', (req, res) => {
  res.json({
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));