// Script para descobrir o Channel ID do YouTube
// Execute este script localmente para obter o ID do canal

async function getChannelId() {
  console.log('Para obter o ID do seu canal YouTube:')
  console.log('')
  console.log('Método 1 - Via URL do canal:')
  console.log('1. Acesse seu canal no YouTube')
  console.log('2. Clique com botão direito e "Ver código fonte"')
  console.log('3. Procure por "channelId" no código')
  console.log('4. O ID será algo como: UC_xxxxxxxxxxxxxxxxxx')
  console.log('')
  console.log('Método 2 - Via YouTube Studio:')
  console.log('1. Acesse studio.youtube.com')
  console.log('2. Vá em Configurações > Canal > Configurações avançadas')
  console.log('3. Copie o "ID do canal"')
  console.log('')
  console.log('Método 3 - Via API (requer chave):')
  console.log('Use: https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@CindyBTC&key=YOUR_API_KEY')
  console.log('')
  console.log('Depois de obter o ID, substitua YOUR_CHANNEL_ID_HERE no arquivo:')
  console.log('/app/api/youtube/route.ts')
}

getChannelId()