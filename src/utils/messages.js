const generateMessage=(username,text,destructIn)=>{
    return {
        username,
        text,
        created_at: new Date().getTime(),
        destructIn
    }
}

const generateLocationMessage=(username,url)=>{
    return {
        username,
        url,
        created_at: new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}