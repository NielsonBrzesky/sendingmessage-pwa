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
    self.clients.openWindow('https://www.example.com') // Substitua pela URL desejada
  )
})

// Escuta o evento de instalação do service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed')
  // Exemplo de código customizado: pré-cache de recursos
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/', '/index.html', '/styles.css', '/script.js', '/icon.png'])
    })
  )
})

// Escuta o evento de ativação do service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated')
  // Exemplo de código customizado: limpeza de caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'v1') {
            console.log('Service Worker: Removing old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Escuta o evento de fetch do service worker
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url)
  // Seu código customizado aqui
})

// Escuta o evento de clique na notificação: Quando o usuário clica na notificação, a aba do navegador é aberta em uma URL específica.
self.addEventListener('notificationclick', function (event) {
  event.notification.close() // Fecha a notificação
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function (clientList) {
      // Verifica se já existe uma aba aberta com a URL desejada
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if (client.url === 'https://coden3.com.br/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Se não houver uma aba aberta, abre uma nova
      if (self.clients.openWindow) {
        return self.clients.openWindow('https://coden3.com.br/')
      }
    })
  )
})
