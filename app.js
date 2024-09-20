require('dotenv').config()
const express = require('express')
const mongoDBConnect = require('./Database/dbConnect')
const app = express()
mongoDBConnect()
const adminRoutes = require('./Routes/AdminRoutes')
const userRoutes = require('./Routes/UserRoutes')
const meetRoutes = require('./Routes/MeetRoutes')
const paymentRoutes = require('./Routes/PaymentRoute')
const domain=process.env.DOMAIN

const cors = require('cors')
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./Helpers/JWT_Auth')

const port = process.env.PORT || 5000

const corsOptions = {
    origin: ['http://localhost:5173','http://localhost:5174'],
    credentials: true, // This allows the server to accept credentials (cookies, headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cookieParser());

app.use(express.json())

app.use(cors(corsOptions));


app.get('/', (req, resp) => {
    resp.send('Hello World')
})
//---------------------------USER ROUTES------------------------------------------------
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/meet" ,meetRoutes)
app.use("/api/payment" ,paymentRoutes)

app.listen(port, () => {
    console.log("Server Is Running At " + port)
})