class Business {
    constructor({ room, media, view, socketBuilder, peerBuilder }) {
        this.room = room
        this.media = media
        this.view = view

        this.socketBuilder = socketBuilder

        this.peerBuilder = peerBuilder

        this.currentStream = {}
        this.socket = {}
        this.currentPeer = {};

        this.peers = new Map();
    }
    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }

    async _init() {
        const audio = false;
        this.currentStream = await this.media.getCamera(audio)

        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.OnPeerCallReceived())
            .setOnPeerStreamReceived(this.OnPeerStreamReceived())
            .build()
        this.addVideoStream('Your Name')
    }

    addVideoStream(userId, stream = this.currentStream) {
        const isCurrentId = false
        this.view.renderVideo({
            userId,
            muted: false,
            stream,
            isCurrentId
        })
    }

    onUserConnected = function() {
        return userId => {
            console.log('user connected!', userId)
            this.currentPeer.call(userId, this.currentStream)
        }
    }

    onUserDisconnected = function() {
        /* Disconectar do socket */
        return userId => {
            console.log('user disconnected!', userId)
        }
    }

    onPeerError = function() {
        return error => {
            console.error('error on peer!', error)
        }
    }

    onPeerConnectionOpened = function() {
        /* Abre a conexao */
        return (peer) => {
            const id = peer.id
            console.log('peer!!', peer)
            this.socket.emit('join-room', this.room, id)
        }
    }

    OnPeerCallReceived = function() {
        /* Chama a funçao para conectar os usuarios na mesma tela */
        return call => {
            console.log('answering call', call);

            call.answer(this.currentStream);
        }
    }

    OnPeerStreamReceived = function() {
        return (call, stream) => {
            /* Depois que inicia a chamada adiciona o video e adiciona o contador */
            const callerId = call.peer;
            this.addVideoStream(callerId, stream);
            this.peers.set(callerId, { call });
            this.view.setParticipants(this.peers.size);
        }
    }
}