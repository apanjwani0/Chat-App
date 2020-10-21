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
            const audioBlob=new Blob(audioFile,{type : 'audio/ogg'})
            //stream.getTracks()[0].clear();
            stream.getTracks().forEach(function(track) {
                track.stop();
              });
            resolve(audioBlob)
        })
        //console.log(mediaRecorder.state)
        mediaRecorder.stop()
    })
    resolve({startRecording,stopRecording})
})

export {recordAudio}



