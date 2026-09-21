import { ConsultaAtendimento } from './agendaModel.js';

export class AgendaAppController {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    const btnLimpeza = document.getElementById('btn-req-limpeza');
    if (btnLimpeza) {
      btnLimpeza.addEventListener('click', () => {
        // Redireciona para o módulo de facilities
        window.location.href = 'facilities.html';
      });
    }

    const notifBell = document.querySelector('.notification-bell');
    if (notifBell) {
      notifBell.addEventListener('click', () => {
        const notifList = document.getElementById('notification-list');
        const notifCount = document.getElementById('notif-count');
        if (notifList && notifCount) {
          // Marca as notificações vermelhas como lidas
          const redNotifs = notifList.querySelectorAll('.notif-red');
          redNotifs.forEach(n => {
            n.classList.remove('notif-red');
            n.style.backgroundColor = 'var(--bg-card)';
            n.style.border = '1px solid var(--border-color)';
            n.style.boxShadow = 'none';
          });
          
          let currentCount = parseInt(notifCount.innerText);
          let newCount = Math.max(0, currentCount - redNotifs.length);
          notifCount.innerText = newCount;
          if(newCount === 0) {
            notifCount.style.display = 'none';
          }
        }
      });
    }
  }
}
