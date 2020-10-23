//Start Recording function

const recordAudio=()=>new Promise(async resolve=>{
    var stream
    var mediaRecorder
    var audioFile=[]
    //await startStreaming()

    async function startStreaming(){
        stream=await navigator.mediaDevices.getUserMedia({audio:true})
        mediaRecorder=new MediaRecorder(stream)
        audioFile=[]
        mediaRecorder.addEventListener('dataavailable',(e)=>{
            audioFile.push(e.data)
            //console.log(mediaRecorder,stream)
        })
    }

    const startRecording=async ()=>{
        await startStreaming()
        try{
            mediaRecorder.start()
            //console.log(mediaRecorder.state)
        }catch(e){
            console.log(e)
        }
        
    }
    //console.log(mediaRecorder.state)
    const stopRecording=()=> new Promise(resolve=>{
        mediaRecorder.addEventListener('stop',()=>{
            const audioBlob=new Blob(audioFile,{type : 'audio/wav'})
            var audioURL=URL.createObjectURL(audioBlob)
            console.log(audioURL,'originalURL')
            stream.getTracks().forEach(function(track) {
                track.stop();
              });
            resolve(audioURL)
        })
        //console.log(mediaRecorder.state)
        mediaRecorder.stop()
    })
    resolve({startRecording,stopRecording})
})

export {recordAudio}



