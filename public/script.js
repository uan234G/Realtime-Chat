const socket = io();
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
    const user = window.prompt("What is your INTERNET name")
    if (!user) {
        user = "anonymous"
    }
    appendMessage('You joined')
    socket.emit('new-user', roomName, user)

    messageForm.addEventListener('submit', e => {
        e.preventDefault();
        const message = messageInput.value
        appendMessage(`You: ${message}`)
        socket.emit("send-chat-message", roomName, message)
        messageInput.value = ''
    })
}


socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`)
})
socket.on('user-connected', name => {
    appendMessage(`${name} joined chat`)
})
socket.on('user-disconnected', name => {
    appendMessage(`${name} left chat`)
})
socket.on('room-created', room => {
    const roomElement = document.createElement('h2')
    roomElement.innerText = room
    const roomLink = document.createElement('a')
    roomLink.href = `/${room}`
    // roomLink.innerText = 'New Chat Room Created'
    roomLink.innerText = 'Join: ' + `${room}`
    roomContainer.append(roomElement)
    roomContainer.append(roomLink)
})


function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}