const USERS = {};
const ADMINS = {};

exports.setupSocket = (io) => {

    io.on('connection', (socket) => {
        // console.log("The socket connected... ", socket.id);

        socket.on("new_user", userId => {
            USERS[userId] = socket.id;
            // console.log("User created", USERS)
            // io.sockets.emit("new_user", USERS);
            // io.sockets.emit("get_user", USERS);
        });

        socket.on("new_admin", userId => {
            ADMINS[userId] = socket.id;
            // console.log("ADMIN created", ADMINS)
            // io.sockets.emit("new_user", USERS);
            // io.sockets.emit("get_user", USERS);
        });

        socket.on("disconnect", () => {
            // console.log("socket disconnected: ", socket.id);
        });

        socket.on('live users changed', (data) => {
            io.emit('live users set', data);
        });

        socket.on('video list refreshed', () => {
            io.emit('video list refreshed', () => {

            })
        })

        socket.on('referrals refresh', (userId) => {
            const socketId = USERS[userId]; 
            if (socketId) {
                io.to(socketId).emit('referrals refresh', { message: 'Referrals have been refreshed' });
            }
        });

        socket.on('attendance_marked', ({user,date}) => {
            const socketId = USERS[user]; 
            console.log(user,date,socketId)
            if (socketId) {
                io.to(socketId).emit('attendance_marked', { date });
                emitToAllAdmins('attendance_marked', { date: date });
            }
        });

        socket.on('update profile', (userId) => {
            const socketId = USERS[userId]; 
            if (socketId) {
                io.to(socketId).emit('update profile', { message: 'Update Profile' });
            }
            emitToAllAdmins('update profile', { message: 'Admin received update profile' });
        });
    });

    const emitToAllAdmins = (event, data) => {
        const adminIds = Object.keys(ADMINS);
    
        adminIds.forEach(adminId => {
            const adminSocketId = ADMINS[adminId];
            if (adminSocketId) {
                io.to(adminSocketId).emit(event, data);
            }
        });
    };
}
