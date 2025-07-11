// Função para gerar mensagens de compartilhamento personalizadas por módulo

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
      ? "🎆 Just completed the SatsLab Bitcoin Course! 🎆\n\n🚀 Mastered all 7 modules covering:\n• Bitcoin fundamentals & economics\n• Security & wallet management\n• Transactions & fee dynamics\n• Mining & proof-of-work\n• Lightning Network\n• Taproot & Inscriptions NFTs\n• Advanced multisig security\n\n🏆 Earned the 'Multisig Master' badge!\n\n#Bitcoin #Learning #SatsLab #Blockchain"
      : "🎆 Acabei de completar o Curso Bitcoin da SatsLab! 🎆\n\n🚀 Dominei todos os 7 módulos cobrindo:\n• Fundamentos e economia do Bitcoin\n• Segurança e gerenciamento de carteiras\n• Transações e dinâmica de taxas\n• Mineração e proof-of-work\n• Lightning Network\n• Taproot e Inscrições NFTs\n• Segurança multisig avançada\n\n🏆 Conquistei o badge 'Mestre Multisig'!\n\n#Bitcoin #Aprendizado #SatsLab #Blockchain"
  }

  // Mensagens específicas por módulo
  const messages = {
    1: {
      en: "🎯 Just completed Module 1 of SatsLab!\n\n📚 Learned Bitcoin fundamentals:\n• What is Bitcoin and blockchain\n• Decentralization vs traditional banking\n• Digital scarcity and monetary policy\n• Bitcoin's revolutionary potential\n\n🏆 Earned the 'Bitcoin Explorer' badge!\n\n#Bitcoin #Learning #SatsLab #Blockchain",
      pt: "🎯 Acabei de completar o Módulo 1 da SatsLab!\n\n📚 Aprendi fundamentos do Bitcoin:\n• O que é Bitcoin e blockchain\n• Descentralização vs bancos tradicionais\n• Escassez digital e política monetária\n• Potencial revolucionário do Bitcoin\n\n🏆 Conquistei o badge 'Explorador Bitcoin'!\n\n#Bitcoin #Aprendizado #SatsLab #Blockchain"
    },
    2: {
      en: "🔐 Just completed Module 2 of SatsLab!\n\n🛡️ Mastered Bitcoin security:\n• Private keys and wallet management\n• Seed phrases and backup strategies\n• Hardware vs software wallets\n• Security best practices\n\n🏆 Earned the 'Security Guardian' badge!\n\n#Bitcoin #Security #SatsLab #Blockchain",
      pt: "🔐 Acabei de completar o Módulo 2 da SatsLab!\n\n🛡️ Dominei segurança Bitcoin:\n• Chaves privadas e gerenciamento de carteiras\n• Seed phrases e estratégias de backup\n• Carteiras hardware vs software\n• Melhores práticas de segurança\n\n🏆 Conquistei o badge 'Guardião da Segurança'!\n\n#Bitcoin #Segurança #SatsLab #Blockchain"
    },
    3: {
      en: "💸 Just completed Module 3 of SatsLab!\n\n⚡ Mastered Bitcoin transactions:\n• Creating and broadcasting transactions\n• Understanding fees and optimization\n• Transaction anatomy and verification\n• UTXO model and coin selection\n\n🏆 Earned the 'Transaction Master' badge!\n\n#Bitcoin #Transactions #SatsLab #Blockchain",
      pt: "💸 Acabei de completar o Módulo 3 da SatsLab!\n\n⚡ Dominei transações Bitcoin:\n• Criação e transmissão de transações\n• Entendendo taxas e otimização\n• Anatomia e verificação de transações\n• Modelo UTXO e seleção de moedas\n\n🏆 Conquistei o badge 'Mestre das Transações'!\n\n#Bitcoin #Transações #SatsLab #Blockchain"
    },
    4: {
      en: "⛏️ Just completed Module 4 of SatsLab!\n\n🔨 Explored Bitcoin mining:\n• Proof-of-Work consensus mechanism\n• Mining difficulty and adjustments\n• Energy usage and sustainability\n• Mining pools and economics\n\n🏆 Earned the 'Digital Miner' badge!\n\n#Bitcoin #Mining #SatsLab #Blockchain",
      pt: "⛏️ Acabei de completar o Módulo 4 da SatsLab!\n\n🔨 Explorei mineração Bitcoin:\n• Mecanismo de consenso Proof-of-Work\n• Dificuldade de mineração e ajustes\n• Uso de energia e sustentabilidade\n• Pools de mineração e economia\n\n🏆 Conquistei o badge 'Minerador Digital'!\n\n#Bitcoin #Mineração #SatsLab #Blockchain"
    },
    5: {
      en: "⚡ Just completed Module 5 of SatsLab!\n\n🚀 Mastered Lightning Network:\n• Layer 2 scaling solution\n• Payment channels and routing\n• Instant micropayments\n• Lightning Network advantages\n\n🏆 Earned the 'Lightning Expert' badge!\n\n#Bitcoin #Lightning #SatsLab #Blockchain",
      pt: "⚡ Acabei de completar o Módulo 5 da SatsLab!\n\n🚀 Dominei Lightning Network:\n• Solução de escalabilidade Layer 2\n• Canais de pagamento e roteamento\n• Micropagamentos instantâneos\n• Vantagens da Lightning Network\n\n🏆 Conquistei o badge 'Especialista Lightning'!\n\n#Bitcoin #Lightning #SatsLab #Blockchain"
    },
    6: {
      en: "🎨 Just completed Module 6 of SatsLab!\n\n🖼️ Explored Taproot & Inscriptions:\n• Taproot upgrade benefits\n• Schnorr signatures efficiency\n• Bitcoin Inscriptions (NFTs)\n• Advanced transaction types\n\n🏆 Earned the 'Inscription Artist' badge!\n\n#Bitcoin #Taproot #Inscriptions #SatsLab #NFTs",
      pt: "🎨 Acabei de completar o Módulo 6 da SatsLab!\n\n🖼️ Explorei Taproot e Inscrições:\n• Benefícios da atualização Taproot\n• Eficiência das assinaturas Schnorr\n• Inscrições Bitcoin (NFTs)\n• Tipos avançados de transações\n\n🏆 Conquistei o badge 'Artista de Inscrições'!\n\n#Bitcoin #Taproot #Inscrições #SatsLab #NFTs"
    },
    7: {
      en: "🔐 Just completed Module 7 of SatsLab!\n\n👥 Mastered Multisig Security:\n• Multi-signature wallets\n• Advanced security practices\n• Collaborative transaction signing\n• Enterprise-grade custody\n\n🏆 Earned the 'Multisig Master' badge!\n\n#Bitcoin #Multisig #Security #SatsLab #Enterprise",
      pt: "🔐 Acabei de completar o Módulo 7 da SatsLab!\n\n👥 Dominei Segurança Multisig:\n• Carteiras multi-assinatura\n• Práticas avançadas de segurança\n• Assinatura colaborativa de transações\n• Custódia de nível empresarial\n\n🏆 Conquistei o badge 'Mestre Multisig'!\n\n#Bitcoin #Multisig #Segurança #SatsLab #Empresarial"
    }
  }

  const moduleMessage = messages[moduleId as keyof typeof messages]
  if (!moduleMessage) {
    // Fallback message
    return isEnglish
      ? `🎯 Just completed ${moduleName} of SatsLab!\n\n🚀 One step closer to Bitcoin mastery!\n\n#Bitcoin #Learning #SatsLab #Blockchain`
      : `🎯 Acabei de completar ${moduleName} da SatsLab!\n\n🚀 Um passo mais próximo do domínio do Bitcoin!\n\n#Bitcoin #Aprendizado #SatsLab #Blockchain`
  }

  return isEnglish ? moduleMessage.en : moduleMessage.pt
}

export function shareToTwitter(message: string) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`
  window.open(tweetUrl, '_blank')
}