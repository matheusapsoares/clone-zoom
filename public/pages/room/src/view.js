class View {
    constructor() {
        this.recorderBtn = document.getElementById('record');
        this.leaveBtn = document.getElementById('leave');
        this.name = '';
    }

    createVideoElement({ muted = true, src, srcObject }) {
        /* Cria o elemento do video com os dados do stream  */
        const video = document.createElement('video')
        video.muted = muted
        video.src = src
        video.srcObject = srcObject

        if (src) {
            video.controls = true
            video.loop = true
            Util.sleep(200).then(_ => video.play())
        }

        if (srcObject) {
            video.addEventListener("loadedmetadata", _ => video.play())
        }

        return video
    }

    renderVideo({ userId, stream = null, url = null, isCurrentId = false }) {

        const video = this.createVideoElement({
            muted: isCurrentId,
            src: url,
            srcObject: stream
        })
        this.appendToHTMLTree(userId, video, isCurrentId)
    }

    appendToHTMLTree(userId, video, isCurrentId) {
        /* Adiciona o video na tela */
        const div = document.createElement('div')
        div.id = userId
        div.classList.add('wrapper')
        div.append(video)

        /* Adicona o id da pessoa no html */
        const div2 = document.createElement('div')
        div2.innerText = userId;
        div.append(div2)

        const videoGrid = document.getElementById('video-grid')
        videoGrid.append(div)
    }

    setParticipants(count) {
        /* Recebe o valor de usuarios conectados e adiciona eu mesmo */
        const total = count + 1;
        const participants = document.getElementById('participants')

        /* substitui o valor na view */
        participants.innerHTML = (total);
    }

    removeVideoElement(id) {
        const element = document.getElementById(id);
        element.remove();
        localStorage.removeItem(id);
    }

    toggleRecordingButtonColor(isActive = true) {
        this.recorderBtn.style.color = this.recordingEnabled ? 'red' : 'white'
    }

    OnRecordClick(command) {
        this.recordingEnabled = false
        return () => {
            const isActive = this.recordingEnabled = !this.recordingEnabled;

            command(this.recordingEnabled);
            this.toggleRecordingButtonColor(isActive);
        }
    }

    OnLeaveClick() {
        return async() => {
            if (confirm("Você realmente quer sair?")) {
                await Util.sleep(3000);
                window.location = '/pages/home';
            }
        }
    }

    configureRecordButton(command) {
        this.recorderBtn.addEventListener('click', this.OnRecordClick(command))
    }

    configureLeaveButton(command) {
        this.leaveBtn.addEventListener('click', this.OnLeaveClick())
    }
}