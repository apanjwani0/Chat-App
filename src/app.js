const path=require('path')
const express=require('express')
const http=require('http')
const socketio=require('socket.io')
const { generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const publicDir =path.join(__dirname,'../public')
const port =process.env.PORT || 3000
const app=express()
const server=http.createServer(app)
const io =socketio(server)

app.use(express.static(publicDir))

app.get('',(req,res)=>{
    res.render('index')
})

io.on('connection',(socket)=>{
    console.log('New Websocket Connection !')
    

    socket.on('new-message',(msg,callback)=>{
        const user=getUser(socket.id)

        io.to(user.room).emit('message',generateMessage(user.username,msg))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`http://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Server','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Server',`${user.username} has Joined!`)) //send to everyone except that socket
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('disconnect',()=>{       //predefined event just like connection
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Server',`${user.username} has left!`)) //broadcast not needed as that socket has already left
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
        
    })

})

server.listen(port,()=>{
    console.log('Server up at port',port)
})