const express = require('express')
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
var Twit = require('twit')

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))

// tweeter api /
var T = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: '',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
})
// var params = {
//     q: '',
//     count: 0
// }
// T.get('search/tweets', params, function (¡err, data, response) {
//     console.log(data)
// })

// chat app
const rooms = {}

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
})

app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    else {
        searchParams = {
            q: '#' + `${req.params.room}`,
            count: 20,
            result_type: "recent"
        }
        console.log(" searched item:", searchParams)
        T.get('search/tweets', searchParams, function (err, data, response) {
            var tweets = data.statuses;
            console.log(tweets)
            for (var i = 0; i < tweets.length; i++) {
                console.log('***************', tweets[i].user.name);
                console.log('***************', tweets[i].text);
            }
            res.render('room', { roomName: req.params.room, data: tweets })
        })
    }
})
app.post('/room', (req, res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    else {
        rooms[req.body.room] = { users: {} }
        res.redirect(req.body.room)
        io.emit('room-created', req.body.room)
    }
})
server.listen(3000)


io.on("connection", socket => {
    // socket.emit("chat-message", "hello world")
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        socket.to(room).broadcast.emit("user-connected", name)
    })
    socket.on('send-chat-message', (room, message) => {
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
    })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name)
        return names
    }, [])
}