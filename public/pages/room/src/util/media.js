class Media {
    async getCamera(audio, video) {
        return navigator.mediaDevices.getUserMedia({
            video,
            audio
        })
    }
}