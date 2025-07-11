export const en = {
  // Homepage
  homepage: {
    hero: {
      title: 'Learn Bitcoin in Practice',
      description: 'Experience Bitcoin through interactive modules, practice on the Signet network, and build your understanding step by step.',
      startCourse: 'Start Course',
      startJourney: 'Start Journey',
      start: 'Start'
    },
    features: {
      title: 'Why take SatsLab?',
      practical: {
        title: 'Practical Learning',
        description: 'Practice with real Bitcoin transactions on the Signet network, without financial risk.'
      },
      badges: {
        title: 'Badge System',
        description: 'Earn badges as you complete modules and master Bitcoin concepts.'
      },
      gradual: {
        title: 'Gradual Progress',
        description: 'Learn at your own pace with structured modules from basic to advanced.'
      }
    },
    modules: {
      1: {
        title: 'Bitcoin and Signet Introduction',
        description: 'Learn the fundamental concepts of Bitcoin and explore the Signet network'
      },
      2: {
        title: 'Security and Wallets',
        description: 'Learn about private keys, wallet security, and creating Bitcoin addresses'
      },
      3: {
        title: 'Signet Transactions',
        description: 'Learn to create and send Bitcoin transactions, understand fees, and use OP_RETURN'
      },
      4: {
        title: 'Mining Simulation',
        description: 'Understand Bitcoin mining through interactive simulation'
      },
      5: {
        title: 'Lightning Network',
        description: 'Learn about the Lightning Network and make instant Bitcoin transactions'
      },
      6: {
        title: 'Taproot and Inscriptions',
        description: 'Explore advanced Bitcoin features: Taproot for privacy and Inscriptions for NFTs'
      },
      7: {
        title: 'Multisig Wallets',
        description: 'Master multisig wallets for advanced security and collaborative transactions'
      }
    }
  },

  // Badges Page
  badges: {
    backToDashboard: 'Back to Dashboard',
    myBadges: 'My Badges',
    title: '🏆 Badge Collection',
    description: 'Badges earned by completing modules and mastering Bitcoin concepts',
    earned: 'Earned',
    earnBadge: 'Earn Badge',
    startModule1: 'Start with Module 1',
    backToModules: 'Back to Modules',
    continueJourney: 'Continue your journey!',
    continueDescription: 'Keep learning and unlock more badges by completing the remaining modules.',
    badgeNames: {
      1: 'Beginner Explorer',
      2: 'Key Guardian',
      3: 'Blockchain Messenger',
      4: 'Digital Miner',
      5: 'Lightning Fast',
      6: 'Advanced Practitioner',
      7: 'Bitcoin Master'
    },
    badgeDescriptions: {
      1: 'Completed Bitcoin introduction and Signet network fundamentals',
      2: 'Mastered wallet security and private key management',
      3: 'Successfully created and sent Bitcoin transactions',
      4: 'Understood Bitcoin mining through practical simulation',
      5: 'Learned Lightning Network and instant transactions',
      6: 'Applied advanced Bitcoin concepts and network mechanics',
      7: 'Achieved complete Bitcoin mastery through comprehensive experience'
    }
  },

  // Wallets Page
  wallets: {
    backToDashboard: 'Back to Dashboard',
    title: 'Bitcoin wallets created during your learning journey on the Signet network',
    networkBadge: 'Signet',
    testNetwork: 'Test Network',
    createNewWallet: 'Create New Wallet',
    createWallet: 'Create Wallet',
    makeTransaction: 'Make Transaction',
    address: 'Address:',
    balance: 'Balance:',
    aboutSignet: 'About Signet Wallets',
    securityInfo: 'These are test wallets on the Signet network. Never use real Bitcoin addresses for testing.',
    signetDescription: 'Signet is a test network that mimics Bitcoin mainnet behavior, perfect for learning without financial risk.'
  },

  // Module System
  module: {
    progress: 'Module Progress',
    objectives: 'Learning Objectives',
    loginRequired: 'Login Required',
    loggedIn: 'Logged In',
    back: 'Back',
    whatYouWillLearn: 'What you will learn:',
    prerequisites: 'Prerequisites:',
    attention: 'Attention:',
    theoreticalQuestions: 'Theoretical Questions',
    practicalTasks: 'Practical Tasks',
    integratedExperience: 'Integrated Experience',
    tasksCompleted: 'Tasks Completed',
    congratulations: 'Congratulations! Module Completed',
    successMessage: 'You have successfully completed Module',
    whatYouLearned: 'What you learned:',
    nextModule: 'Next Module:',
    backToStart: 'Back to Start',
    startLearning: 'Start Learning',
    continue: 'Continue',
    nextQuestion: 'Next Question',
    viewResults: 'View Results',
    validateAnswer: 'Validate Answer'
  },

  // Interactive Components
  interactive: {
    lightning: {
      send: 'Send',
      receive: 'Receive',
      generateInvoice: 'Generate Invoice',
      sendPayment: 'Send Payment',
      lightningAddress: 'Lightning Address'
    },
    transaction: {
      create: 'Create Transaction',
      send: 'Send Transaction',
      success: 'Success!',
      hash: 'Transaction Hash',
      value: 'Value (sBTC)'
    },
    mining: {
      mining: 'Mining',
      stopped: 'Stopped',
      blockMined: 'Block Successfully Mined!'
    },
    faucet: {
      success: 'Faucet request successful!',
      instructions: 'Use the faucet to get test bitcoins for practice.'
    }
  },

  // Common UI Elements
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    retry: 'Retry'
  },

  // Module Content - Module 1
  module1: {
    title: 'Bitcoin and Signet Introduction',
    description: 'Learn the fundamental concepts of Bitcoin and explore the Signet network',
    objectives: [
      'Understand what Bitcoin is and how it works',
      'Learn about blockchain technology',
      'Explore the Signet test network',
      'Understand the difference between Bitcoin and traditional currencies',
      'Learn about decentralization and peer-to-peer networks'
    ],
    questions: [
      {
        question: 'What is Bitcoin?',
        options: [
          'A digital currency controlled by banks',
          'A decentralized digital currency without central authority',
          'A payment system only for online purchases',
          'A type of credit card'
        ],
        correct: 1,
        explanation: 'Bitcoin is a decentralized digital currency that operates without a central authority, allowing peer-to-peer transactions.'
      },
      {
        question: 'What is the Signet network?',
        options: [
          'The main Bitcoin network',
          'A private Bitcoin network for companies',
          'A test network that mimics Bitcoin mainnet behavior',
          'A network for altcoins'
        ],
        correct: 2,
        explanation: 'Signet is a test network that mimics Bitcoin mainnet behavior, perfect for learning and testing without financial risk.'
      },
      {
        question: 'What is a blockchain?',
        options: [
          'A type of database',
          'A chain of blocks containing transaction data',
          'A computer program',
          'A type of cryptocurrency'
        ],
        correct: 1,
        explanation: 'A blockchain is a chain of blocks, where each block contains transaction data and is linked to the previous block.'
      },
      {
        question: 'What makes Bitcoin decentralized?',
        options: [
          'It is controlled by multiple banks',
          'It has no central authority controlling it',
          'It is managed by the government',
          'It is controlled by mining companies'
        ],
        correct: 1,
        explanation: 'Bitcoin is decentralized because no single entity or authority controls it; it is maintained by a network of participants.'
      }
    ],
    tasks: [
      {
        title: 'Explore the Signet Network',
        description: 'Connect to the Signet network and explore its features',
        instructions: 'Follow the steps to connect to Signet and understand how it works.',
        hint: 'Signet is similar to Bitcoin mainnet but uses test coins without real value.'
      },
      {
        title: 'Create Your First Bitcoin Address',
        description: 'Generate a Bitcoin address on the Signet network',
        instructions: 'Use the wallet generator to create your first Bitcoin address.',
        hint: 'A Bitcoin address is like a bank account number for receiving bitcoins.'
      }
    ],
    badge: {
      name: 'Beginner Explorer',
      description: 'Completed Bitcoin introduction and Signet network fundamentals'
    }
  },

  // Module Content - Module 2
  module2: {
    title: 'Security and Wallets',
    description: 'Learn about private keys, wallet security, and creating Bitcoin addresses',
    objectives: [
      'Understand private keys and public keys',
      'Learn about wallet security best practices',
      'Create and manage Bitcoin addresses',
      'Understand seed phrases and backup',
      'Learn about different types of wallets'
    ],
    questions: [
      {
        question: 'What is a private key?',
        options: [
          'A password for your email',
          'A secret number that controls your bitcoins',
          'A public address',
          'A type of wallet'
        ],
        correct: 1,
        explanation: 'A private key is a secret number that gives you control over your bitcoins. Never share your private key!'
      },
      {
        question: 'What is a seed phrase?',
        options: [
          'A password for your wallet',
          'A set of 12 or 24 words used to recover your wallet',
          'A type of cryptocurrency',
          'A blockchain address'
        ],
        correct: 1,
        explanation: 'A seed phrase is a set of 12 or 24 words that can be used to recover your entire wallet and all your bitcoins.'
      },
      {
        question: 'Why should you never share your private key?',
        options: [
          'It is not important',
          'Anyone with your private key can steal your bitcoins',
          'It is too long to share',
          'It is automatically shared'
        ],
        correct: 1,
        explanation: 'Your private key gives complete control over your bitcoins. If someone else has it, they can steal all your funds.'
      }
    ],
    tasks: [
      {
        title: 'Create a Secure Wallet',
        description: 'Generate a new wallet with proper security practices',
        instructions: 'Create a wallet and securely store your private key and seed phrase.',
        hint: 'Always backup your seed phrase in a safe place!'
      },
      {
        title: 'Practice Address Generation',
        description: 'Generate multiple Bitcoin addresses from your wallet',
        instructions: 'Use your wallet to generate different addresses for receiving bitcoins.',
        hint: 'You can generate multiple addresses from the same wallet for privacy.'
      }
    ],
    badge: {
      name: 'Key Guardian',
      description: 'Mastered wallet security and private key management'
    }
  },

  // Module Content - Module 3
  module3: {
    title: 'Signet Transactions',
    description: 'Learn to create and send Bitcoin transactions, understand fees, and use OP_RETURN',
    objectives: [
      'Create and send Bitcoin transactions',
      'Understand transaction fees',
      'Learn about OP_RETURN for data storage',
      'Understand transaction confirmation',
      'Learn about UTXO model'
    ],
    questions: [
      {
        question: 'What is a Bitcoin transaction?',
        options: [
          'A bank transfer',
          'A transfer of bitcoin value from one address to another',
          'A type of payment card',
          'A blockchain password'
        ],
        correct: 1,
        explanation: 'A Bitcoin transaction is a transfer of bitcoin value from one address to another, recorded on the blockchain.'
      },
      {
        question: 'What is OP_RETURN?',
        options: [
          'A type of wallet',
          'A way to store small amounts of data on the blockchain',
          'A mining algorithm',
          'A type of address'
        ],
        correct: 1,
        explanation: 'OP_RETURN is a Bitcoin script opcode that allows storing small amounts of data on the blockchain.'
      },
      {
        question: 'Why do Bitcoin transactions have fees?',
        options: [
          'To pay banks',
          'To pay miners for processing transactions',
          'To pay the government',
          'To pay wallet providers'
        ],
        correct: 1,
        explanation: 'Transaction fees are paid to miners as an incentive to include your transaction in a block.'
      }
    ],
    tasks: [
      {
        title: 'Send Your First Transaction',
        description: 'Create and send a Bitcoin transaction on Signet',
        instructions: 'Use your wallet to send bitcoins to another address.',
        hint: 'Make sure you have enough balance and set an appropriate fee.'
      },
      {
        title: 'Use OP_RETURN for Data Storage',
        description: 'Create a transaction with OP_RETURN to store data',
        instructions: 'Add a message to the blockchain using OP_RETURN.',
        hint: 'OP_RETURN allows you to store up to 80 bytes of data.'
      }
    ],
    badge: {
      name: 'Blockchain Messenger',
      description: 'Successfully created and sent Bitcoin transactions'
    }
  },

  // Module Content - Module 4
  module4: {
    title: 'Mining Simulation',
    description: 'Understand Bitcoin mining through interactive simulation',
    objectives: [
      'Understand Bitcoin mining process',
      'Learn about proof-of-work',
      'Explore mining difficulty adjustment',
      'Understand block rewards and halving',
      'Learn about hash functions and nonces'
    ],
    questions: [
      {
        question: 'What is Bitcoin mining?',
        options: [
          'Creating new bitcoins from nothing',
          'The process of validating transactions and adding them to the blockchain',
          'A way to buy bitcoins',
          'A type of wallet'
        ],
        correct: 1,
        explanation: 'Bitcoin mining is the process of validating transactions and adding them to the blockchain while securing the network.'
      },
      {
        question: 'What is proof-of-work?',
        options: [
          'A type of wallet',
          'A consensus mechanism that requires computational work to validate blocks',
          'A mining pool',
          'A type of transaction'
        ],
        correct: 1,
        explanation: 'Proof-of-work is a consensus mechanism that requires miners to perform computational work to validate blocks and secure the network.'
      }
    ],
    tasks: [
      {
        title: 'Mining Simulation',
        description: 'Experience Bitcoin mining through interactive simulation',
        instructions: 'Use the mining simulator to understand how blocks are mined.',
        hint: 'Mining involves finding a hash that meets the difficulty target.'
      },
      {
        title: 'Understand Block Structure',
        description: 'Explore the components of a Bitcoin block',
        instructions: 'Learn about block headers, transactions, and merkle trees.',
        hint: 'Each block contains a header with metadata and a list of transactions.'
      }
    ],
    badge: {
      name: 'Digital Miner',
      description: 'Understood Bitcoin mining through practical simulation'
    }
  },

  // Module Content - Module 5
  module5: {
    title: 'Lightning Network',
    description: 'Learn about the Lightning Network and make instant Bitcoin transactions',
    objectives: [
      'Understand the Lightning Network',
      'Learn about payment channels',
      'Make instant Bitcoin transactions',
      'Understand routing and network effects',
      'Learn about Lightning invoices'
    ],
    questions: [
      {
        question: 'What is the Lightning Network?',
        options: [
          'A type of Bitcoin wallet',
          'A second layer solution for instant Bitcoin transactions',
          'A new cryptocurrency',
          'A mining pool'
        ],
        correct: 1,
        explanation: 'The Lightning Network is a second layer solution that enables instant, low-cost Bitcoin transactions.'
      },
      {
        question: 'What is a payment channel?',
        options: [
          'A type of wallet',
          'A direct connection between two parties for instant transactions',
          'A blockchain address',
          'A mining algorithm'
        ],
        correct: 1,
        explanation: 'A payment channel is a direct connection between two parties that allows instant Bitcoin transactions without waiting for blockchain confirmation.'
      }
    ],
    tasks: [
      {
        title: 'Open a Lightning Channel',
        description: 'Open your first Lightning Network payment channel',
        instructions: 'Connect to the Lightning Network and open a channel.',
        hint: 'You need to lock some bitcoins in a channel to start making Lightning transactions.'
      },
      {
        title: 'Make Lightning Payments',
        description: 'Send and receive payments through the Lightning Network',
        instructions: 'Use Lightning invoices to send and receive instant payments.',
        hint: 'Lightning payments are instant and have very low fees.'
      },
      {
        title: 'Generate Lightning Invoice',
        description: 'Create invoices to receive Lightning payments',
        instructions: 'Generate an invoice that others can pay via Lightning.',
        hint: 'Lightning invoices contain all the information needed for payment.'
      }
    ],
    badge: {
      name: 'Lightning Fast',
      description: 'Learned Lightning Network and instant transactions'
    }
  },

  // Module Content - Module 6
  module6: {
    title: 'Advanced Concepts',
    description: 'Explore advanced Bitcoin concepts and network mechanics',
    objectives: [
      'Understand advanced Bitcoin scripting',
      'Learn about multi-signature transactions',
      'Explore Bitcoin scaling solutions',
      'Understand network security and consensus',
      'Learn about Bitcoin development and improvements'
    ],
    questions: [
      {
        question: 'What is a multi-signature transaction?',
        options: [
          'A transaction with multiple inputs',
          'A transaction that requires multiple private keys to authorize',
          'A transaction with multiple outputs',
          'A Lightning Network transaction'
        ],
        correct: 1,
        explanation: 'A multi-signature transaction requires multiple private keys to authorize, providing enhanced security for shared funds.'
      },
      {
        question: 'What is Bitcoin Script?',
        options: [
          'A programming language for Bitcoin transactions',
          'A type of wallet',
          'A mining algorithm',
          'A payment method'
        ],
        correct: 0,
        explanation: 'Bitcoin Script is a stack-based programming language used to define the conditions under which bitcoins can be spent.'
      }
    ],
    tasks: [
      {
        title: 'Advanced Transaction Types',
        description: 'Create and understand advanced Bitcoin transactions',
        instructions: 'Explore multi-signature and time-locked transactions.',
        hint: 'Advanced transactions provide enhanced security and functionality.'
      },
      {
        title: 'Bitcoin Network Analysis',
        description: 'Analyze Bitcoin network metrics and health',
        instructions: 'Study network statistics, mempool, and block propagation.',
        hint: 'Understanding network health is crucial for Bitcoin operations.'
      }
    ],
    badge: {
      name: 'Advanced Practitioner',
      description: 'Applied advanced Bitcoin concepts and network mechanics'
    }
  },

  // Module Content - Module 7
  module7: {
    title: 'Complete Bitcoin Experience',
    description: 'Apply all learned concepts in a comprehensive Bitcoin experience',
    objectives: [
      'Apply all learned Bitcoin concepts',
      'Complete a full Bitcoin transaction lifecycle',
      'Demonstrate wallet management skills',
      'Show understanding of security practices',
      'Master Bitcoin ecosystem navigation'
    ],
    questions: [
      {
        question: 'What is the most important aspect of Bitcoin security?',
        options: [
          'Using a hardware wallet',
          'Keeping your private keys secure and private',
          'Using strong passwords',
          'Encrypting your wallet'
        ],
        correct: 1,
        explanation: 'The most important aspect of Bitcoin security is keeping your private keys secure and private, as they give complete control over your funds.'
      },
      {
        question: 'What makes Bitcoin valuable?',
        options: [
          'Government backing',
          'Scarcity, utility, and network adoption',
          'Mining difficulty',
          'Transaction fees'
        ],
        correct: 1,
        explanation: 'Bitcoin derives value from its scarcity (limited supply), utility (peer-to-peer transactions), and network adoption.'
      }
    ],
    tasks: [
      {
        title: 'Complete Bitcoin Workflow',
        description: 'Perform a complete Bitcoin transaction workflow',
        instructions: 'Create wallet, receive funds, send transaction, verify on blockchain.',
        hint: 'This comprehensive task combines all skills learned throughout the course.'
      },
      {
        title: 'Bitcoin Ecosystem Navigation',
        description: 'Navigate the Bitcoin ecosystem confidently',
        instructions: 'Use various Bitcoin tools, explorers, and services.',
        hint: 'Understanding the ecosystem is key to becoming a Bitcoin expert.'
      },
      {
        title: 'Security Best Practices',
        description: 'Implement comprehensive Bitcoin security measures',
        instructions: 'Apply all security best practices learned throughout the course.',
        hint: 'Security is paramount in Bitcoin - implement multiple layers of protection.'
      }
    ],
    badge: {
      name: 'Bitcoin Master',
      description: 'Achieved complete Bitcoin mastery through comprehensive experience'
    }
  },

  // Donation Component
  donation: {
    supportButton: 'Support SatsLab',
    title: 'Donate Sats',
    description: 'Support SatsLab development',
    lightning: 'Lightning',
    onchain: 'On-chain',
    amountLabel: 'Amount (sats)',
    amountPlaceholder: 'Enter the amount of sats',
    suggestedAmounts: 'Suggested amounts',
    cancel: 'Cancel',
    donateNow: 'Donate Now',
    loading: 'Opening BTCPay...',
    errorCreatingInvoice: 'Error creating invoice',
    unknownError: 'Unknown error'
  }
}