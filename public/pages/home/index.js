window.onload = () => {
    const redirectWithRoomId = element => {
        element.addEventListener('click', () => {
            const room = prompt('Por favor, digite o nome da sala')
            if (!room) {
                alert('Nenhuma sala disponivel')
                return;
            }
            window.open('/pages/room/?room=' + room);
        })
    }

    const msgWithout = element => {
        element.addEventListener('click', () => {
            alert('Em construção...');

        })
    }

    const join = document.getElementById('join')
    const newMeeting = document.getElementById('new-meeting')

    const schedule = document.getElementById('schedule')
    const screen_share = document.getElementById('screen_share')

    redirectWithRoomId(join)
    redirectWithRoomId(newMeeting)

    msgWithout(schedule)
    msgWithout(screen_share);

    /* Seta a data atual */
    setDateNow();

}

setDateNow = () => {
    /* adiciona o date */
    const now = new Date;
    const time = `${now.getHours()}:${now.getMinutes()}`;

    const clock = document.getElementById('clock')

    /* substitui o valor na view */
    clock.innerHTML = (time);

    const dayName = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    const monName = ["janeiro", "fevereiro", "março", "abril", "Maio", "junho", "agosto", "outubro", "novembro", "dezembro"];

    const date = `${dayName[now.getDay()]}, ${now.getDate()} de ${monName[now.getMonth()]} de ${now.getFullYear()}`;

    const dateId = document.getElementById('date')
    dateId.innerHTML = (date);
}