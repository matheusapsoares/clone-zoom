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
        this.usersRecordings = new Map();
    }
    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }

    async _init() {
        const audio = true;
        const video = true;

        /* Configura o botao de gravar */
        this.view.configureRecordButton(this.onRecordPressed.bind(this));

        this.view.configureLeaveButton(this.onLeavePressed.bind(this))

        this.currentStream = await this.media.getCamera(audio, video)

        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())

        .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.OnPeerCallReceived())
            .setOnPeerStreamReceived(this.OnPeerStreamReceived())
            .setOnCallError(this.onPeerCallError())
            .setOnCallClose(this.onPeerCallClose())
            .build()
        this.addVideoStream(this.currentPeer.id)
    }

    addVideoStream(userId, stream = this.currentStream) {
        const recorderInstance = new Recorder(userId, stream);
        this.usersRecordings.set(recorderInstance.filename, recorderInstance);
        if (this.recordingEnabled) {
            recorderInstance.startRecording();
        }

        const isCurrentId = userId === this.currentPeer.id;
        this.view.renderVideo({
            userId,
            stream,
            isCurrentId
        })
    }

    onUserConnected() {
        return userId => {
            console.log('user connected!', userId)
            this.currentPeer.call(userId, this.currentStream)
        }
    }

    onUserDisconnected() {
        /* Disconectar do socket */
        return userId => {
            console.log('user disconnected!', userId)

            /* Verifica se o user existe no peers */
            if (this.peers.has(userId)) {
                /* fecha a conexao e deleta */
                this.peers.get(userId).call.close()
                this.peers.delete(userId);
            }

            /* Ajusta a quantidade de usuarios */
            this.view.setParticipants(this.peers.size);

            /* para a gravacao do user */
            this.stopRecording(userId);

            /* remove o elemento da tela */
            this.view.removeVideoElement(userId);
        }
    }

    onPeerError() {
        return error => {
            console.error('error on peer!', error)
        }
    }

    onPeerConnectionOpened() {
        /* Abre a conexao */
        return (peer) => {
            const id = peer.id
            console.log('peer!!', peer)
            this.socket.emit('join-room', this.room, id)
        }
    }

    OnPeerCallReceived() {
        /* Chama a funçao para conectar os usuarios na mesma tela */
        return call => {
            console.log('answering call', call);

            call.answer(this.currentStream);
        }
    }

    OnPeerStreamReceived() {
        return (call, stream) => {
            /* Depois que inicia a chamada adiciona o video e adiciona o contador */
            const callerId = call.peer;
            if (this.peers.has(callerId)) {
                console.log('two calls and remove', callerId);
                return;
            }

            this.addVideoStream(callerId, stream);
            this.peers.set(callerId, { call });
            this.view.setParticipants(this.peers.size);
        }
    }

    onPeerCallError() {
        return (call, error) => {
            console.log('an call error ocurred', error);
            this.view.removeVideoElement(call.peer);
        }
    }

    onPeerCallClose() {
        return (call) => {
            console.log('call closed!!', call);

        }
    }

    onRecordPressed(recordingEnabled) {
        this.recordingEnabled = recordingEnabled;

        console.log('clicou !!!!! ', recordingEnabled);

        for (const [key, value] of this.usersRecordings) {
            if (this.recordingEnabled) {
                value.startRecording();
                continue;
            }

            this.stopRecording(key);
        }
    }

    /* se o user entrar e sair da call para a gravacao dele atuais e anteriores */
    async stopRecording(userId) {
        const usersRecordings = this.usersRecordings;
        for (const [key, value] of usersRecordings) {
            const isContextUser = key.includes(userId);
            if (!isContextUser) continue;

            const rec = value;
            const isRecordingActive = rec.recordingActive;
            if (!isRecordingActive) continue;

            await rec.stopRecording();

            this.playRecordings(key);
        }
    }

    playRecordings(userId) {
        const user = this.usersRecordings.get(userId);

        /* Resgata todos as gravaçoes do user */
        const videosURLs = user.getAllVideoURLs();
        videosURLs.map(url => {
            this.view.renderVideo({ url, userId });
        })

    }

    onLeavePressed() {
        this.usersRecordings.forEach((value, key) => value.download());
    }
}