const socket = io();

// Variables for elemtns
const messageForm = document.querySelector('#message-form');
const messageInput = messageForm.querySelector('input');
const messageButton = messageForm.querySelector('button');
const locationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');


// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// get the url and ignore the prefix to get username and room and send it to the backend
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

//
const autoscroll = () => {
    // lastElementChild is going to grab lase element as a child --> at the bottom
    const newMessage = messages.lastElementChild

    // height of the new message

    const newMessageStyles = getComputedStyle(newMessage)
    // getting the margin bottom of the newMessage
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    // total height is the margin bottom plus the height of the message element
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // how far scrolled down
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }

}

// to send the message data (username, message, createdAt) to the server and render
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// create a location sharing Messages
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

// to get the room data and display room name and users in the sidebar
socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// when the form is submitted the the message is sent to the server
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable the form button
    messageButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value;
    // emit message sent by the client
    // acknowledgement
    socket.emit('sendMessage', message, (error) => {
        // enable the form button
        messageButton.removeAttribute('disabled')
        messageInput.value = '';
        messageInput.focus();
        if (error) {
            return console.log(error)
        } else {
            console.log('Delivered!')
        }
    })
})

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by you browser')
    } else {
        // disable the send location button while the location is being sent
        locationButton.setAttribute('disabled', 'disabled')

        navigator.geolocation.getCurrentPosition((position) => {
            // have client emit "sendLocation" with an object as the data
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                console.log('Location Shared!')
                locationButton.removeAttribute('disabled')
            })
        })
    }
})

// to get the username and room entered by the user and send it to the backend
socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})