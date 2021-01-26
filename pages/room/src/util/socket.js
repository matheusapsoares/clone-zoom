class SocketBuilder {
    constructor({ socketUrl }) {
        this.socketUrl = socketUrl;
        this.OnUserConnected = () => {};
        this.OnUserDisconnected = () => {};
    }

    setOnUserConnected(fn) {
        this.OnUserConnected = fn;

        return this;
    }

    setOnUserDisconnected(fn) {
        this.OnUserDisconnected = fn;

        return this;
    }

    build() {
        const socket = io.connect(this.socketUrl, {
            withCredentials: false
        })

        socket.on('user-connected', this.onUserConnected)
        socket.on('user-disconnected', this.onUserDisconnected)

        return socket
    }
}