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
const io=new Server(server,{
    cors:{
        origin:'*'
    }
})

setupSocket(io)
module.exports= {io}

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
    credentials: true, // This allows the server to accept credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cookieParser());

app.use(express.json())

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname,'qrcodes')));

app.get('/', (req, resp) => {
    resp.send('Hello World')
})
//---------------------------USER ROUTES------------------------------------------------
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/meet" ,meetRoutes)
app.use("/api/payment" ,paymentRoutes)
app.use("/api/faqs" ,isAuthenticated,FAQRoutes)
app.use("/api/videos" ,isAuthenticated,videoRoutes)

server.listen(port, () => {
    console.log("Server Is Running At " + port)
})