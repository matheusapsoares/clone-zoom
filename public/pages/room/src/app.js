const onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    console.log('this is the room', room)

    const socketUrl = 'https://fast-fortress-08052.herokuapp.com'
    const socketBuilder = new SocketBuilder({ socketUrl })

    /* recebe os valores para a conf do peer */
    const peerConfig = Object.values({
        id: undefined,
        config: {
            host: 'pacific-castle-89918.herokuapp.com',
            secure: true,
            path: '/'
        }
    })
    const peerBuilder = new PeerBuilder({ peerConfig })

    const view = new View()
    const media = new Media()
    const deps = {
        view,
        media,
        room,
        socketBuilder,
        peerBuilder
    }

    Business.initialize(deps)

}

window.onload = onload