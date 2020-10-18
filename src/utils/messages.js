const generateMessage=(username,text)=>{
    return {
        username,
        text,
        created_at: new Date().getTime()
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