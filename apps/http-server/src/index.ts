import express from 'express';
import cors from 'cors';


import eventChainRoute from './events/events.js';
import authRoute from './auth/auth.js';
import ticketRoute from './ticket/ticket.js';
import tiersRoute from './tiers/tiers.js';

const app = express();
app.use(cors()); // Allow Postman and frontend
app.use(express.json());

app.get('/', (req, res) => {
  res.send('EventChain API Server');
});

app.use('/events', eventChainRoute);
app.use('/auth', authRoute);
app.use('/tickets', ticketRoute);
app.use('/tiers', tiersRoute);

app.listen(process.env.PORT || 3001 , () => {
  console.log('Server is running on http://localhost:3001');
});