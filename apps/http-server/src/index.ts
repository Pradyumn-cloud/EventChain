import express from 'express';

import eventChainRoute from './events/events.js';
import authRoute  from './auth/auth.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('This is envent chain route main page');
});

app.use('/events', eventChainRoute);
app.use('/auth', authRoute);

app.listen(process.env.PORT || 3001 , () => {
  console.log('Server is running on http://localhost:3001');
});