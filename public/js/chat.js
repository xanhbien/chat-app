const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#side-bar-template').innerHTML

//Options

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMassageMarign = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMassageMarign

    //Visible height
    const visibleHeight = $message.offsetHeight

    // Height of message container
    const contentHeight = $message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight
    if(contentHeight - newMessageHeight <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }

}


socket.on('message', (message) => {
   // console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm: a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()

})


socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm: a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
    
})


socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    let message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        
        console.log('Message delevered!')

    });

})

document.querySelector('#send-location').addEventListener('click', (e) => {
    $sendLocationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        return alert('Geolocation is not suppored by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })

})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href="/"
    }
})
