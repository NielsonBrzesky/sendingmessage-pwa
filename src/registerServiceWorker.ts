import CryptoJS from 'crypto-js'

const publicVapidKey =
  'BOc4XoWWX6ggheu3H-HYmkmnPA4wX5np-TqUuIcfqilxt3UCHWPUMB1ch36jYBoeuJ6yJxWeEVvzGVg07dkEoZM'

// Solicita permissão para notificações
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    // Verifica se o navegador suporta Service Workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(async (registration: ServiceWorkerRegistration) => {
          console.log('Service Worker registrado com sucesso:', registration)

          // Verifica se o navegador suporta Push Manager
          if (!('PushManager' in window)) {
            throw new Error('Push messaging não é suportado.')
          }

          // Verificar se já existe uma inscrição
          const existingSubscription = await registration.pushManager.getSubscription()
          if (existingSubscription) {
            // Cancelar a inscrição existente
            await existingSubscription.unsubscribe()
            console.log('Inscrição existente cancelada.')
          }

          try {
            // Inscrever-se novamente com a nova chave
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            })

            // Verificar se os campos Auth e P256DH estão presentes
            const subscriptionJson = subscription.toJSON()
            console.log('Subscription JSON:', subscriptionJson) // Adicionar log para inspecionar o conteúdo

            // Tenta analisar a resposta como JSON
            try {
              const parsedResponse = JSON.parse(JSON.stringify(subscriptionJson))
              console.log('Inscrição de Push Manager:', parsedResponse)
            } catch (jsonError) {
              console.error('Erro ao analisar a resposta JSON:', jsonError)
              console.error('Resposta recebida:', subscriptionJson)
            }

            if (
              !subscriptionJson.keys ||
              !subscriptionJson.keys.auth ||
              !subscriptionJson.keys.p256dh
            ) {
              throw new Error('A inscrição não contém os campos necessários.')
            }

            // Gerar um installationId único
            const installationId = generateUUID()

            // Ajustar a estrutura do JSON para o formato esperado pelo back-end
            const formattedSubscriptionJSON = {
              installationId: installationId,
              platform: 'browser',
              pushChannel: {
                endpoint: subscriptionJson.endpoint,
                p256dh: subscriptionJson.keys.p256dh,
                auth: subscriptionJson.keys.auth
              }
            }

            // Enviar a inscrição para o back-end
            await sendSubscriptionToBackend(formattedSubscriptionJSON)
          } catch (error) {
            console.error('Erro ao inscrever-se no Push Manager:', error)
          }
        })
        .catch((error) => {
          console.error('Erro ao registrar o Service Worker:', error)
        })
    }
  }
})

// Converte uma string Base64 URL-safe em um array de bytes (Uint8Array)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Gera um token de assinatura de acesso compartilhado (SAS) para autenticação.
function getSelfSignedToken(connectionString: string, expiryMinutes: number) {
  const [endpoint, sasKeyName, sasKeyValue] = connectionString
    .split(';')
    .map((part) => part.split('=')[1])
  const expiry = Math.floor(new Date().getTime() / 1000) + expiryMinutes * 60
  const stringToSign = encodeURIComponent(endpoint) + '\n' + expiry
  const hmac = CryptoJS.HmacSHA256(stringToSign, sasKeyValue)
  const signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hmac))
  return `SharedAccessSignature sr=${endpoint}&sig=${signature}&se=${expiry}&skn=${sasKeyName}`
}

// Função para gerar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Função para enviar a inscrição para o back-end
async function sendSubscriptionToBackend(subscription: any) {
  console.log('Enviando inscrição para o back-end:', subscription)

  // Gerar o token de autenticação
  const connectionString =
    'Endpoint=sb://sendingmessagesnotification.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=0mldQ0+u3uvR3QxnG8+YZS5OzI2MhPod9Ey5Fn6rU='
  const token = getSelfSignedToken(connectionString, 60) // 60 minutos de validade

  // Enviar a inscrição para o servidor com autenticação
  try {
    const response = await fetch('https://localhost:7127/api/Notification/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar a inscrição para o servidor.')
    }

    console.log('Inscrição enviada com sucesso para o servidor.')
  } catch (error) {
    console.error('Erro ao enviar a inscrição para o servidor:', error)
  }
}
