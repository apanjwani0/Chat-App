const socket=io()

import { recordAudio } from './functions.js'


const $messageForm= document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocation=document.querySelector('#send-location')
const $recordAudio=document.querySelector('#record-audio')

const $messages=document.querySelector('#messages')
const $sidebar=document.querySelector('#sidebar')
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const audioMessageTemplate=document.querySelector('#audio-message-template').innerHTML

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
    const align= username.trim().toLowerCase() === message.username ? "right" :"left"
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        time: moment(message.created_at).format('h:mm a'),
        id:message.created_at,
        align:align
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
    
    const deleteMessage=()=>{
        var element = document.getElementById(`${message.created_at}`)
        element.parentNode.removeChild(element)
        console.log(`#${message.created_at} deleted after ${message.destructIn*1000}ms`)
    }

    if(message.destructIn!=-1) setTimeout(deleteMessage,message.destructIn*1000)
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
    const align= username.trim().toLowerCase() === locationURL.username ? "right" :"left"
    console.log(locationURL)
    const html=Mustache.render(locationTemplate,{
        username:locationURL.username,
        locationURL:locationURL.url,
        time: moment(locationURL.created_at).format('h:mm a'),
        id:locationURL.created_at,
        align:align
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll()

    const deleteMessage=()=>{
        var element = document.getElementById(`${locationURL.created_at}`)
        element.parentNode.removeChild(element)
        console.log(`#${locationURL.created_at} deleted after ${locationURL.destructIn*1000}ms`)
    }

    if(locationURL.destructIn!=-1) setTimeout(deleteMessage,locationURL.destructIn*1000)
})

socket.on('audioMessage',(audioMessage)=>{
    const align= username.trim().toLowerCase() === audioMessage.username ? "right" :"left"

    var duration //to get duration
    var audioContext = new (window.AudioContext || window.webkitAudioContext)()
    var req=new XMLHttpRequest()
    req.open('GET',audioMessage.audioURL)
    req.responseType='arraybuffer'
    req.onload=function(){
        audioContext.decodeAudioData(req.response,function(buffer){
            duration= parseInt(buffer.duration)
            console.log(duration,'testing')
            const html=Mustache.render(audioMessageTemplate,{
                audioURL:audioMessage.audioURL,
                username:audioMessage.username,
                time: moment(audioMessage.created_at).format('h:mm a'),
                id:audioMessage.created_at,
                align:align
            })
            $messages.insertAdjacentHTML("beforeend",html)
            autoScroll()
            // var aud = document.getElementById(audioMessage.created_at).children
            // aud[1].addEventListener("durationchange",()=>{
            //     console.log(aud[1].duration);
            //     console.log('Here!')
            // })
            // aud[1].addEventListener("loadedmetadata",()=>{
            //     console.log(aud[1].duration);
            //     console.log('Loaded meta data')
            // })

            //deletes after duration+destructIn value
            const deleteAfter=audioMessage.destructIn*1+duration*1
            const deleteMessage=()=>{
                var element = document.getElementById(`${audioMessage.created_at}`)
                element.parentNode.removeChild(element)
                console.log(`#${audioMessage.created_at} deleted after ${deleteAfter*1000}ms`)
            }
            if(audioMessage.destructIn!=-1) setTimeout(deleteMessage,(deleteAfter*1000))
        })
    }
    req.send()
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
    var destructIn=document.getElementById('secs').value
    $sendLocation.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
            destructIn:destructIn
        },()=>{
            $sendLocation.removeAttribute('disabled','disabled')
            console.log('Location Shared')
        })
    })
})

var recording=false

const recorder=async()=>{
    const {startRecording,stopRecording}=await recordAudio()
    $recordAudio.addEventListener('click',async (e)=>{
        if(!recording){
            console.log('Start Recording')
            await startRecording()
            recording=true
            $recordAudio.innerHTML="Recording"
            $recordAudio.setAttribute("style","background-color:blue")
        }else{
            console.log('Stop Recording')
            var destructIn=document.getElementById('secs').value
            const audioURL=await stopRecording()
            //console.log(audioURL)
            socket.emit('new-audio-message',{audioURL,destructIn},()=>{
                recording=false
            })
            $recordAudio.innerHTML="Record"
            $recordAudio.setAttribute("style","background-color:none")
        }
    })
}
recorder()





socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})