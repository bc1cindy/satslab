// Função para gerar mensagens de compartilhamento personalizadas por módulo
// Limite: 270 caracteres + link satslab.org

interface ShareAchievementProps {
  moduleId: number
  moduleName: string
  isEnglish: boolean
}

export function generateShareMessage({ moduleId, moduleName, isEnglish }: ShareAchievementProps): string {
  // Remover verificação especial para módulo 7 com isCompleted
  // A mensagem deve refletir apenas a conclusão do módulo 7, não de todos os módulos

  // Mensagens específicas por módulo (máximo 270 caracteres)
  const messages = {
    1: {
      en: "Just completed SatsLab Module 1! Learned about Bitcoin fundamentals, blockchain technology and digital scarcity for free. Earned the Bitcoin Explorer badge! Start your Bitcoin journey at https://satslab.org/",
      pt: "Completei o Módulo 1 da SatsLab! Aprendi gratuitamente sobre fundamentos do Bitcoin, tecnologia blockchain e escassez digital. Conquistei o badge Explorador Bitcoin! Comece sua jornada Bitcoin em https://satslab.org/"
    },
    2: {
      en: "Just completed SatsLab Module 2! Learned about Bitcoin security, private keys and wallet management for free. Earned the Security Guardian badge! Learn secure Bitcoin practices at https://satslab.org/",
      pt: "Completei o Módulo 2 da SatsLab! Aprendi gratuitamente sobre segurança Bitcoin, chaves privadas e gerenciamento de carteiras. Conquistei o badge Guardião da Segurança! Aprenda Bitcoin seguro em https://satslab.org/"
    },
    3: {
      en: "Just completed SatsLab Module 3! Learned about Bitcoin transactions, fees and the UTXO model for free. Earned the Transaction Master badge! Learn Bitcoin transactions at https://satslab.org/",
      pt: "Completei o Módulo 3 da SatsLab! Aprendi gratuitamente sobre transações Bitcoin, taxas e o modelo UTXO. Conquistei o badge Mestre das Transações! Aprenda sobre transações Bitcoin em https://satslab.org/"
    },
    4: {
      en: "Just completed SatsLab Module 4! Learned about Bitcoin mining, Proof-of-Work and network security for free. Earned the Digital Miner badge! Learn Bitcoin mining at https://satslab.org/",
      pt: "Completei o Módulo 4 da SatsLab! Aprendi gratuitamente sobre mineração Bitcoin, Proof-of-Work e segurança da rede. Conquistei o badge Minerador Digital! Aprenda mineração Bitcoin em https://satslab.org/"
    },
    5: {
      en: "Just completed SatsLab Module 5! Learned about Lightning Network, instant payments and Layer 2 scaling for free. Earned the Lightning Expert badge! Learn Lightning Network at https://satslab.org/",
      pt: "Completei o Módulo 5 da SatsLab! Aprendi gratuitamente sobre Lightning Network, pagamentos instantâneos e escalonamento Layer 2. Conquistei o badge Especialista Lightning! Aprenda Lightning Network em https://satslab.org/"
    },
    6: {
      en: "Just completed SatsLab Module 6! Learned about Taproot, Schnorr signatures and Bitcoin Inscriptions for free. Earned the Inscription Artist badge! Learn Taproot and Bitcoin NFTs at https://satslab.org/",
      pt: "Completei o Módulo 6 da SatsLab! Aprendi gratuitamente sobre Taproot, assinaturas Schnorr e Inscrições Bitcoin. Conquistei o badge Artista de Inscrições! Aprenda Taproot e NFTs Bitcoin em https://satslab.org/"
    },
    7: {
      en: "Just completed SatsLab Module 7! Learned about Multisig wallets and enterprise Bitcoin security for free. Earned the Multisig Master badge! Learn advanced Bitcoin security at https://satslab.org/",
      pt: "Completei o Módulo 7 da SatsLab! Aprendi gratuitamente sobre carteiras Multisig e segurança empresarial Bitcoin. Conquistei o badge Mestre Multisig! Aprenda segurança avançada Bitcoin em https://satslab.org/"
    }
  }

  const moduleMessage = messages[moduleId as keyof typeof messages]
  if (!moduleMessage) {
    // Fallback message
    return isEnglish
      ? `Just completed ${moduleName} of SatsLab! One step closer to learning Bitcoin for free! Learn Bitcoin at https://satslab.org/`
      : `Completei ${moduleName} da SatsLab! Um passo mais próximo de aprender Bitcoin gratuitamente! Aprenda Bitcoin em https://satslab.org/`
  }

  return isEnglish ? moduleMessage.en : moduleMessage.pt
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function shareToTwitter(message: string) {
  const encodedMessage = encodeURIComponent(message)
  
  if (isMobile()) {
    // Tenta abrir o app do X primeiro, depois fallback para web
    const appUrl = `twitter://post?message=${encodedMessage}`
    const webUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`
    
    // Cria um link temporário para tentar abrir o app
    const tempLink = document.createElement('a')
    tempLink.href = appUrl
    tempLink.style.display = 'none'
    document.body.appendChild(tempLink)
    
    // Timeout para fallback caso o app não abra
    const timer = setTimeout(() => {
      window.open(webUrl, '_blank')
    }, 500)
    
    // Tenta abrir o app
    tempLink.click()
    
    // Cleanup
    document.body.removeChild(tempLink)
    
    // Se a página perder foco (app abriu), cancela o fallback
    const handleBlur = () => {
      clearTimeout(timer)
      window.removeEventListener('blur', handleBlur)
    }
    window.addEventListener('blur', handleBlur)
    
  } else {
    // Desktop: abre diretamente na web
    const webUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`
    window.open(webUrl, '_blank')
  }
}