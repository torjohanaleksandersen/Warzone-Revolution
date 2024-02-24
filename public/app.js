const socket = io()


socket.on('msg', data => {
    console.log(data)
})