import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { storeId, amount, currency = 'SATS', paymentMethod = 'lightning' } = await request.json()

    console.log('Dados recebidos:', { storeId, amount, currency, paymentMethod })

    if (!storeId || !amount || amount <= 0) {
      console.error('Validação falhou:', { storeId, amount })
      return NextResponse.json(
        { error: 'Store ID e quantidade são obrigatórios' },
        { status: 400 }
      )
    }

    const btcpayUrl = process.env.BTCPAY_URL || 'https://demo.btcpayserver.org'
    const apiKey = process.env.BTCPAY_API_KEY

    console.log('Configuração BTCPay:', { btcpayUrl, hasApiKey: !!apiKey })

    if (!apiKey) {
      console.error('BTCPay API key não configurada')
      return NextResponse.json(
        { error: 'BTCPay API key não configurada' },
        { status: 500 }
      )
    }

    const invoiceData = {
      amount: amount.toString(),
      currency,
      metadata: {
        buyerName: 'Apoiador SatsLab',
        itemDesc: 'Doação para SatsLab'
      }
    }

    console.log('Enviando para BTCPay:', { url: `${btcpayUrl}/api/v1/stores/${storeId}/invoices`, invoiceData })

    const response = await fetch(`${btcpayUrl}/api/v1/stores/${storeId}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey}`
      },
      body: JSON.stringify(invoiceData)
    })

    console.log('Resposta BTCPay:', { status: response.status, statusText: response.statusText })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('BTCPay API error:', { status: response.status, error: errorData })
      return NextResponse.json(
        { error: 'Erro ao criar invoice no BTCPay', details: errorData },
        { status: response.status }
      )
    }

    const invoice = await response.json()

    // Determinar o método de pagamento preferido
    let paymentString = ''
    let qrCode = ''

    if (paymentMethod === 'lightning' && invoice.paymentMethods) {
      const lightningMethod = invoice.paymentMethods.find(
        (method: any) => method.paymentType === 'LightningNetwork'
      )
      if (lightningMethod) {
        paymentString = lightningMethod.destination
        qrCode = lightningMethod.qrCode
      }
    } else if (paymentMethod === 'onchain' && invoice.paymentMethods) {
      const onchainMethod = invoice.paymentMethods.find(
        (method: any) => method.paymentType === 'BTCLike'
      )
      if (onchainMethod) {
        paymentString = onchainMethod.destination
        qrCode = onchainMethod.qrCode
      }
    }

    // Fallback para o primeiro método disponível
    if (!paymentString && invoice.paymentMethods && invoice.paymentMethods.length > 0) {
      const firstMethod = invoice.paymentMethods[0]
      paymentString = firstMethod.destination
      qrCode = firstMethod.qrCode
    }

    const result = {
      id: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      paymentString,
      qrCode,
      checkoutUrl: `${btcpayUrl}/i/${invoice.id}`,
      expiresAt: invoice.expirationTime
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating BTCPay invoice:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}