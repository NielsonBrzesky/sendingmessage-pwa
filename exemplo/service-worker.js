// self.addEventListener('push', function (event) {
//   const options = {
//     body: event.data ? event.data.text() : 'Processo realizado com susseso',
//     icon: 'icons8-shield.png',
//     badge: 'icons8-submit.png'
//   }

//   event.waitUntil(self.registration.showNotification('TESTE PUSH CODEN3', options))
// })

// self.addEventListener('notificationclick', function (event) {
//   event.notification.close()
//   //event.waitUntil(clients.openWindow('https://www.google.com.br/'))
// })

// Escuta o evento de push: Quando uma notificação push é recebida, exibe uma notificação com um título e corpo.
// Escuta o evento de clique na notificação: Quando o usuário clica na notificação, a aba do navegador é aberta em uma URL específica.
// Certifique-se de ajustar os caminhos dos ícones (icon.png e badge.png) e a URL (https://www.example.com) conforme necessário para o seu projeto.

self.addEventListener('push', function (event) {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: 'path/to/icon.png',
    badge: 'path/to/badge.png'
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})
