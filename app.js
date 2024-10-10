require('dotenv').config()
const express = require('express')
const mongoDBConnect = require('./Database/dbConnect')
const app = express()
const { setupSocket } =require('./socket') 
const path=require('path')
mongoDBConnect()
const domain=process.env.DOMAIN

const {Server}=require('socket.io')
const {createServer}=require('http')
const server = createServer(app)

const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL,process.env.ADMIN_URL],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  });

setupSocket(io)
// module.exports= io

const adminRoutes = require('./Routes/AdminRoutes')
const userRoutes = require('./Routes/UserRoutes')
const meetRoutes = require('./Routes/MeetRoutes')
const paymentRoutes = require('./Routes/PaymentRoute')
const FAQRoutes = require('./Routes/FAQRoutes')
const videoRoutes = require('./Routes/VideosRoutes')

const cors = require('cors')
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./Helpers/JWT_Auth')

const port = process.env.PORT || 5000

const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cookieParser());

app.use(express.json())

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname,'qrcodes')));

app.get('/', (req, resp) => {
    resp.send('Hello World!')
})

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// Verify webhook signature
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-interakt-signature'];
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(body).digest('hex');
  
  if (signature === digest) {
    next();
  } else {
    res.status(401).send('Invalid signature');
  }
}

// Webhook endpoint to receive messages
app.post('/webhook', verifyWebhookSignature, (req, res) => {
  const { messages } = req.body;
  
  messages.forEach(message => {
    console.log(`Received message from ${message.from}: ${message.text.body}`);
    handleUserResponse(message);
  });
  
  res.sendStatus(200);
});

//---------------------------USER ROUTES------------------------------------------------
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/meetings" ,meetRoutes)
app.use("/api/payments" ,paymentRoutes)
app.use("/api/faqs" ,isAuthenticated,FAQRoutes)
app.use("/api/videos" ,isAuthenticated,videoRoutes)

server.listen(port, () => {
    console.log("Server Is Running At " + port)
})