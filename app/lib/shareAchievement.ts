// Função para gerar mensagens de compartilhamento personalizadas por módulo
// Limite: 270 caracteres + link satslab.org

interface ShareAchievementProps {
  moduleId: number
  moduleName: string
  isEnglish: boolean
  isCompleted?: boolean
}

export function generateShareMessage({ moduleId, moduleName, isEnglish, isCompleted = false }: ShareAchievementProps): string {
  if (moduleId === 7 && isCompleted) {
    // Mensagem especial para conclusão completa do curso
    return isEnglish 
      ? "Just completed all 7 SatsLab Bitcoin modules! Mastered fundamentals, Lightning Network, Taproot, and advanced Multisig security. Earned the Multisig Master badge! Learn Bitcoin at https://satslab.org/"
      : "Completei todos os 7 módulos Bitcoin da SatsLab! Dominei fundamentos, Lightning Network, Taproot e segurança Multisig avançada. Conquistei o badge Mestre Multisig! Aprenda Bitcoin em https://satslab.org/"
  }

  // Mensagens específicas por módulo (máximo 270 caracteres)
  const messages = {
    1: {
      en: "Just completed SatsLab Module 1! Learned Bitcoin fundamentals, blockchain technology and digital scarcity. Earned the Bitcoin Explorer badge! Start your Bitcoin journey at https://satslab.org/",
      pt: "Completei o Módulo 1 da SatsLab! Aprendi fundamentos do Bitcoin, tecnologia blockchain e escassez digital. Conquistei o badge Explorador Bitcoin! Comece sua jornada Bitcoin em https://satslab.org/"
    },
    2: {
      en: "Just completed SatsLab Module 2! Mastered Bitcoin security, private keys and wallet management. Earned the Security Guardian badge! Learn secure Bitcoin practices at https://satslab.org/",
      pt: "Completei o Módulo 2 da SatsLab! Dominei segurança Bitcoin, chaves privadas e gerenciamento de carteiras. Conquistei o badge Guardião da Segurança! Aprenda Bitcoin seguro em https://satslab.org/"
    },
    3: {
      en: "Just completed SatsLab Module 3! Mastered Bitcoin transactions, fees and the UTXO model. Earned the Transaction Master badge! Master Bitcoin transactions at https://satslab.org/",
      pt: "Completei o Módulo 3 da SatsLab! Dominei transações Bitcoin, taxas e o modelo UTXO. Conquistei o badge Mestre das Transações! Domine transações Bitcoin em https://satslab.org/"
    },
    4: {
      en: "Just completed SatsLab Module 4! Explored Bitcoin mining, Proof-of-Work and network security. Earned the Digital Miner badge! Learn Bitcoin mining at https://satslab.org/",
      pt: "Completei o Módulo 4 da SatsLab! Explorei mineração Bitcoin, Proof-of-Work e segurança da rede. Conquistei o badge Minerador Digital! Aprenda mineração Bitcoin em https://satslab.org/"
    },
    5: {
      en: "Just completed SatsLab Module 5! Mastered Lightning Network, instant payments and Layer 2 scaling. Earned the Lightning Expert badge! Learn Lightning Network at https://satslab.org/",
      pt: "Completei o Módulo 5 da SatsLab! Dominei Lightning Network, pagamentos instantâneos e escalonamento Layer 2. Conquistei o badge Especialista Lightning! Aprenda Lightning Network em https://satslab.org/"
    },
    6: {
      en: "Just completed SatsLab Module 6! Explored Taproot, Schnorr signatures and Bitcoin Inscriptions. Earned the Inscription Artist badge! Learn Taproot and Bitcoin NFTs at https://satslab.org/",
      pt: "Completei o Módulo 6 da SatsLab! Explorei Taproot, assinaturas Schnorr e Inscrições Bitcoin. Conquistei o badge Artista de Inscrições! Aprenda Taproot e NFTs Bitcoin em https://satslab.org/"
    },
    7: {
      en: "Just completed SatsLab Module 7! Mastered Multisig wallets and enterprise Bitcoin security. Earned the Multisig Master badge! Learn advanced Bitcoin security at https://satslab.org/",
      pt: "Completei o Módulo 7 da SatsLab! Dominei carteiras Multisig e segurança empresarial Bitcoin. Conquistei o badge Mestre Multisig! Aprenda segurança avançada Bitcoin em https://satslab.org/"
    }
  }

  const moduleMessage = messages[moduleId as keyof typeof messages]
  if (!moduleMessage) {
    // Fallback message
    return isEnglish
      ? `Just completed ${moduleName} of SatsLab! One step closer to Bitcoin mastery! Learn Bitcoin at https://satslab.org/`
      : `Completei ${moduleName} da SatsLab! Um passo mais próximo do domínio do Bitcoin! Aprenda Bitcoin em https://satslab.org/`
  }

  return isEnglish ? moduleMessage.en : moduleMessage.pt
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function hasTwitterApp(): boolean {
  // Detecta se o app do X/Twitter está instalado no mobile
  return isMobile() && /Twitter|X/i.test(navigator.userAgent)
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