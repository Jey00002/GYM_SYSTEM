# INSTRUCCIONES PARA ARREGLAR EL ERROR DE GOOGLE OAUTH

PARA ARREGLAR EL ERROR DE GOOGLE OAUTH:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu proyecto de Google
3. Busca las credenciales de OAuth 2.0 Client ID
4. En 'Authorized JavaScript origins', agrega EXACTAMENTE:
   https://gym-system-black.vercel.app
   
5. En 'Authorized redirect URIs', agrega:
   https://gym-system-black.vercel.app
   https://gym-system-black.vercel.app/login
   (o la ruta de callback que uses)
   
6. Guarda los cambios y espera 5 minutos para que se propaguen
