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
      ? "🎆 Just completed all 7 SatsLab modules! 🚀 Bitcoin fundamentals → Lightning → Taproot → Multisig mastery! 🏆 Earned 'Multisig Master' badge! Learn Bitcoin: https://satslab.org/ #Bitcoin #SatsLab"
      : "🎆 Completei todos os 7 módulos da SatsLab! 🚀 Fundamentos → Lightning → Taproot → Multisig dominado! 🏆 Badge 'Mestre Multisig' conquistado! Aprenda Bitcoin: https://satslab.org/ #Bitcoin #SatsLab"
  }

  // Mensagens específicas por módulo (máximo 270 caracteres)
  const messages = {
    1: {
      en: "🎯 Just completed SatsLab Module 1! 📚 Learned Bitcoin fundamentals, blockchain tech & digital scarcity. 🏆 Earned 'Bitcoin Explorer' badge! Start your journey: https://satslab.org/ #Bitcoin #SatsLab",
      pt: "🎯 Completei o Módulo 1 da SatsLab! 📚 Aprendi fundamentos do Bitcoin, blockchain e escassez digital. 🏆 Badge 'Explorador Bitcoin' conquistado! Comece: https://satslab.org/ #Bitcoin #SatsLab"
    },
    2: {
      en: "🔐 Just completed SatsLab Module 2! 🛡️ Mastered Bitcoin security, private keys & wallet management. 🏆 Earned 'Security Guardian' badge! Learn secure Bitcoin: https://satslab.org/ #Bitcoin #SatsLab",
      pt: "🔐 Completei o Módulo 2 da SatsLab! 🛡️ Dominei segurança Bitcoin, chaves privadas & carteiras. 🏆 Badge 'Guardião da Segurança' conquistado! Aprenda: https://satslab.org/ #Bitcoin #SatsLab"
    },
    3: {
      en: "💸 Just completed SatsLab Module 3! ⚡ Mastered Bitcoin transactions, fees & UTXO model. 🏆 Earned 'Transaction Master' badge! Master Bitcoin transactions: https://satslab.org/ #Bitcoin #SatsLab",
      pt: "💸 Completei o Módulo 3 da SatsLab! ⚡ Dominei transações Bitcoin, taxas & modelo UTXO. 🏆 Badge 'Mestre das Transações' conquistado! Aprenda: https://satslab.org/ #Bitcoin #SatsLab"
    },
    4: {
      en: "⛏️ Just completed SatsLab Module 4! 🔨 Explored Bitcoin mining, Proof-of-Work & network security. 🏆 Earned 'Digital Miner' badge! Learn mining: https://satslab.org/ #Bitcoin #SatsLab #Mining",
      pt: "⛏️ Completei o Módulo 4 da SatsLab! 🔨 Explorei mineração Bitcoin, Proof-of-Work & segurança. 🏆 Badge 'Minerador Digital' conquistado! Aprenda: https://satslab.org/ #Bitcoin #SatsLab"
    },
    5: {
      en: "⚡ Just completed SatsLab Module 5! 🚀 Mastered Lightning Network, instant payments & Layer 2. 🏆 Earned 'Lightning Expert' badge! Learn Lightning: https://satslab.org/ #Bitcoin #Lightning #SatsLab",
      pt: "⚡ Completei o Módulo 5 da SatsLab! 🚀 Dominei Lightning Network, pagamentos instantâneos & Layer 2. 🏆 Badge 'Especialista Lightning' conquistado! Aprenda: https://satslab.org/ #Bitcoin #SatsLab"
    },
    6: {
      en: "🎨 Just completed SatsLab Module 6! 🖼️ Explored Taproot, Schnorr signatures & Bitcoin Inscriptions (NFTs). 🏆 Earned 'Inscription Artist' badge! Learn Taproot: https://satslab.org/ #Bitcoin #SatsLab",
      pt: "🎨 Completei o Módulo 6 da SatsLab! 🖼️ Explorei Taproot, assinaturas Schnorr & Inscrições Bitcoin (NFTs). 🏆 Badge 'Artista de Inscrições' conquistado! Aprenda: https://satslab.org/ #Bitcoin"
    },
    7: {
      en: "🔐 Just completed SatsLab Module 7! 👥 Mastered Multisig wallets & enterprise security. 🏆 Earned 'Multisig Master' badge! Learn advanced security: https://satslab.org/ #Bitcoin #Multisig #SatsLab",
      pt: "🔐 Completei o Módulo 7 da SatsLab! 👥 Dominei carteiras Multisig & segurança empresarial. 🏆 Badge 'Mestre Multisig' conquistado! Aprenda segurança: https://satslab.org/ #Bitcoin #SatsLab"
    }
  }

  const moduleMessage = messages[moduleId as keyof typeof messages]
  if (!moduleMessage) {
    // Fallback message
    return isEnglish
      ? `🎯 Just completed ${moduleName} of SatsLab! 🚀 One step closer to Bitcoin mastery! Learn Bitcoin: https://satslab.org/ #Bitcoin #SatsLab`
      : `🎯 Completei ${moduleName} da SatsLab! 🚀 Um passo mais próximo do domínio do Bitcoin! Aprenda Bitcoin: https://satslab.org/ #Bitcoin #SatsLab`
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