require('dotenv').config()
const express = require('express')
const mongoDBConnect = require('./Database/dbConnect')
const app = express()
const { setupSocket, USERS } = require('./socket')
const path = require('path')
mongoDBConnect()
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');

app.use(bodyParser.json());

const { Server } = require('socket.io')
const { createServer } = require('http')
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

setupSocket(io)
// module.exports= {io}

const adminRoutes = require('./Routes/AdminRoutes')
const userRoutes = require('./Routes/UserRoutes')
const meetRoutes = require('./Routes/MeetRoutes')
const paymentRoutes = require('./Routes/PaymentRoute')
const FAQRoutes = require('./Routes/FAQRoutes')
const videoRoutes = require('./Routes/VideosRoutes')

const cors = require('cors')
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./Helpers/JWT_Auth')
const UserModel = require('./Models/UserModel')
const { whatsappVerificationSuccess } = require('./Helpers/Interakt')

const port = process.env.PORT || 5000

const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cookieParser());

app.use(express.json())

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'qrcodes')));

app.get('/', (req, resp) => {
  resp.send('Hello World!')
})

// const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

// Verify webhook signature
// function verifyWebhookSignature(req, res, next) {
//   const receivedHmac = req.headers['interakt-signature'];
//   const dataString = JSON.stringify(req.body);

//   function verifyHmac(receivedHmac, dataString, key) {
//     const generatedHmac = CryptoJS.HmacSHA256(dataString, key);
//     const generatedHmacBase64 = "sha256=" + CryptoJS.enc.Hex.stringify(generatedHmac);
//     return generatedHmacBase64 === receivedHmac;
//   }

//   if (verifyHmac(receivedHmac, dataString, WEBHOOK_SECRET)) {
//     next();
//   } else {
//     res.status(401).send('Invalid signature');
//   }
// }

// // Webhook endpoint to receive messages
// app.post('/webhook', verifyWebhookSignature, (req, res) => {
//   const { message,customer } = req.body.data;
//   console.log(customer,message)

//   console.log("body: "+req.body)

//   // messages.forEach(message => {
//   //   console.log(`Received message from ${message.from}: ${message.text.body}`);
//   //   handleUserResponse(message);
//   // });

//   res.sendStatus(200);
// });

app.post('/webhook', async (req, res) => {
  const { message, mobile } = req.body;
  console.log(req.body)
  try {
    const user = await UserModel.findOne({ phoneNumber: `+${mobile}` }).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    if (/^verify$/i.test(message)) {
      if (user.isWhatsAppVerified) res.status(200)
      else {
        user.isWhatsAppVerified = true;
        await user.save();
        // whatsappVerificationSuccess(mobile, user.username)
        const socketId = USERS[user._id];
        console.log("socketid: ",socketId)
        if (socketId) {
          // io.to(socketId).emit('whatsapp_verified', { 
          //   message: 'Your WhatsApp has been successfully verified.',
          //   user:user
          //  });
        }
      }
    }

    return res.status(200)

  } catch (error) {
    console.log("error in webhook: ", error)
    res.status(500)
  }
});

//---------------------------USER ROUTES------------------------------------------------
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/meetings", meetRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/faqs", isAuthenticated, FAQRoutes)
app.use("/api/videos", isAuthenticated, videoRoutes)

server.listen(port, () => {
  console.log("Server Is Running At " + port)
})