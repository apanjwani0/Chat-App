const socket=io()

const $messageForm= document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocation=document.querySelector('#send-location')

const $messages=document.querySelector('#messages')
const $sidebar=document.querySelector('#sidebar')
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll=()=>{
    const $newMessages=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessages)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessages.offsetHeight +newMessageMargin

    const visibleHeight=$messages.offsetHeight
    const containerHeight=$messages.scrollHeight
    const scrollOffset=$messages.scrollTop +visibleHeight
    if(containerHeight-newMessageHeight <=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}


socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        time: moment(message.created_at).format('h:mm a'),
        id:message.created_at
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
    setTimeout(()=>{
        var element = document.getElementById(`${message.created_at}`)
        element.parentNode.removeChild(element)
        console.log(`#${message.created_at} deleted after ${message.destructIn*1000}ms`)
    },(message.destructIn*1000))
})

socket.on('roomData',({room,users})=>{
    console.log({room,users})
    const html =Mustache.render(sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML=html

})

socket.on('locationMessage',(locationURL)=>{
    console.log(locationURL)
    const html=Mustache.render(locationTemplate,{
        username:locationURL.username,
        locationURL:locationURL.url,
        time: moment(locationURL.created_at).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageForm.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    const destructIn=e.target.elements.destructIn.value
    socket.emit('new-message',{message,destructIn},()=>{
        $messageForm.removeAttribute('disabled','disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        console.log('Message Delivered!')
    })
})

$sendLocation.addEventListener('click',(e)=>{
    //e.preventDefault()
    $sendLocation.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled','disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})