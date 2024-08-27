// Escuta o evento de push: Quando uma notificação push é recebida, exibe uma notificação com um título e corpo.
self.addEventListener('push', function (event) {
  console.log('TESTE DE PUSH: NOTIFICAÇÃO RECEBIDA! ', event)

  let data = {}
  if (event.data) {
    try {
      data = event.data.json() // Tenta analisar os dados como JSON
      console.log('DATA: ', data)
    } catch (e) {
      console.error('Erro ao analisar os dados da notificação:', e)
      data = { title: 'Notificação', body: 'Você tem uma nova mensagem.' }
    }
  } else {
    data = { title: 'Notificação', body: 'Você tem uma nova mensagem.' }
  }

  const options = {
    body: data.message,
    icon: 'path/to/icon.png',
    badge: 'path/to/badge.png'
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      // Envia a mensagem para a aplicação principal
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION',
            data: data
          })
        })
      })
    })
  )
})

// Escuta o evento de clique na notificação: Quando o usuário clica na notificação, a aba do navegador é aberta em uma URL específica.
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow('https://coden3.com.br/') // Colocar URL desejada
  )
})
