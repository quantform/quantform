export const TTT = {
  address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  metadata: {
    name: 'pump',
    version: '0.1.0',
    spec: '0.1.0'
  },
  instructions: [
    {
      name: 'initialize',
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      docs: ['Creates the global state.'],
      accounts: [
        {
          name: 'global',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'user',
          writable: true,
          signer: true
        },
        {
          name: 'systemProgram',
          address: '11111111111111111111111111111111'
        }
      ],
      args: []
    },
    {
      name: 'setParams',
      discriminator: [165, 31, 134, 53, 189, 180, 130, 255],
      docs: ['Sets the global state parameters.'],
      accounts: [
        {
          name: 'global',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'user',
          writable: true,
          signer: true
        },
        {
          name: 'systemProgram',
          address: '11111111111111111111111111111111'
        },
        {
          name: 'eventAuthority',
          address: 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
        },
        {
          name: 'program',
          address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
        }
      ],
      args: [
        {
          name: 'feeRecipient',
          type: 'pubkey'
        },
        {
          name: 'initialVirtualTokenReserves',
          type: 'u64'
        },
        {
          name: 'initialVirtualSolReserves',
          type: 'u64'
        },
        {
          name: 'initialRealTokenReserves',
          type: 'u64'
        },
        {
          name: 'tokenTotalSupply',
          type: 'u64'
        },
        {
          name: 'feeBasisPoints',
          type: 'u64'
        }
      ]
    },
    {
      name: 'create',
      discriminator: [24, 30, 200, 40, 5, 28, 7, 119],
      docs: ['Creates a new coin and bonding curve.'],
      accounts: [
        {
          name: 'mint',
          writable: true,
          signer: true
        },
        {
          name: 'mint_authority',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [
                  109, 105, 110, 116, 45, 97, 117, 116, 104, 111, 114, 105, 116, 121
                ]
              }
            ]
          }
        },
        {
          name: 'bondingCurve',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101]
              },
              {
                kind: 'account',
                path: 'mint'
              }
            ]
          }
        },
        {
          name: 'associatedBondingCurve',
          writable: true,
          signer: false
        },
        {
          name: 'global',
          writable: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'mplTokenMetadata',
          address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
        },
        {
          name: 'metadata',
          writable: true,
          signer: false
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram',
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram',
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        {
          name: 'rent',
          address: 'SysvarRent111111111111111111111111111111111'
        },
        {
          name: 'eventAuthority',
          address: 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
        },
        {
          name: 'program',
          address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
        }
      ],
      args: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'symbol',
          type: 'string'
        },
        {
          name: 'uri',
          type: 'string'
        },
        {
          name: 'creator',
          type: 'pubkey'
        }
      ]
    },
    {
      name: 'buy',
      discriminator: [102, 6, 61, 18, 1, 218, 235, 234],
      docs: ['Buys tokens from a bonding curve.'],
      accounts: [
        {
          name: 'global',
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'feeRecipient',
          writable: true,
          signer: false
        },
        {
          name: 'mint',
          writable: false,
          signer: false
        },
        {
          name: 'bondingCurve',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101]
              },
              {
                kind: 'account',
                path: 'mint'
              }
            ]
          }
        },
        {
          name: 'associatedBondingCurve',
          writable: true,
          signer: false
        },
        {
          name: 'associatedUser',
          writable: true,
          signer: false
        },
        {
          name: 'user',
          writable: true,
          signer: true
        },
        {
          name: 'systemProgram',
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram',
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'rent',
          address: 'SysvarRent111111111111111111111111111111111'
        },
        {
          name: 'eventAuthority',
          address: 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
        },
        {
          name: 'program',
          address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
        }
      ],
      args: [
        {
          name: 'amount',
          type: 'u64'
        },
        {
          name: 'maxSolCost',
          type: 'u64'
        }
      ]
    },
    {
      name: 'sell',
      discriminator: [51, 230, 133, 164, 1, 127, 131, 173],
      docs: ['Sells tokens into a bonding curve.'],
      accounts: [
        {
          name: 'global',
          writable: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'feeRecipient',
          writable: true,
          signer: false
        },
        {
          name: 'mint',
          writable: false,
          signer: false
        },
        {
          name: 'bondingCurve',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101]
              },
              {
                kind: 'account',
                path: 'mint'
              }
            ]
          }
        },
        {
          name: 'associatedBondingCurve',
          writable: true,
          signer: false
        },
        {
          name: 'associatedUser',
          writable: true,
          signer: false
        },
        {
          name: 'user',
          writable: true,
          signer: true
        },
        {
          name: 'systemProgram',
          address: '11111111111111111111111111111111'
        },
        {
          name: 'associatedTokenProgram',
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        {
          name: 'tokenProgram',
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'eventAuthority',
          address: 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
        },
        {
          name: 'program',
          address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
        }
      ],
      args: [
        {
          name: 'amount',
          type: 'u64'
        },
        {
          name: 'minSolOutput',
          type: 'u64'
        }
      ]
    },
    {
      name: 'withdraw',
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34],
      docs: [
        'Allows the admin to withdraw liquidity for a migration once the bonding curve completes'
      ],
      accounts: [
        {
          name: 'global',
          writable: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [103, 108, 111, 98, 97, 108]
              }
            ]
          }
        },
        {
          name: 'lastWithdraw',
          writable: true,
          signer: false
        },
        {
          name: 'mint',
          writable: false,
          signer: false
        },
        {
          name: 'bondingCurve',
          writable: true,
          pda: {
            seeds: [
              {
                kind: 'const',
                value: [98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101]
              },
              {
                kind: 'account',
                path: 'mint'
              }
            ]
          }
        },
        {
          name: 'associatedBondingCurve',
          writable: true,
          signer: false
        },
        {
          name: 'associatedUser',
          writable: true,
          signer: false
        },
        {
          name: 'user',
          writable: true,
          signer: true
        },
        {
          name: 'system_program',
          address: '11111111111111111111111111111111'
        },
        {
          name: 'tokenProgram',
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'rent',
          address: 'SysvarRent111111111111111111111111111111111'
        },
        {
          name: 'eventAuthority',
          address: 'Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1'
        },
        {
          name: 'program',
          address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'bondingCurve',
      discriminator: [23, 183, 248, 55, 96, 216, 172, 96]
    },
    {
      name: 'global',
      discriminator: [167, 232, 232, 177, 200, 108, 114, 127]
    }
  ],
  events: [
    {
      name: 'createEvent',
      discriminator: [27, 114, 169, 77, 222, 235, 99, 118]
    },
    {
      name: 'tradeEvent',
      discriminator: [189, 219, 127, 211, 78, 230, 97, 238]
    },
    {
      name: 'completeEvent',
      discriminator: [95, 114, 97, 156, 212, 46, 152, 8]
    },
    {
      name: 'setParamsEvent',
      discriminator: [223, 195, 159, 246, 62, 48, 143, 131]
    }
  ],
  types: [
    {
      name: 'global',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'initialized',
            type: 'bool'
          },
          {
            name: 'authority',
            type: 'pubkey'
          },
          {
            name: 'feeRecipient',
            type: 'pubkey'
          },
          {
            name: 'initialVirtualTokenReserves',
            type: 'u64'
          },
          {
            name: 'initialVirtualSolReserves',
            type: 'u64'
          },
          {
            name: 'initialRealTokenReserves',
            type: 'u64'
          },
          {
            name: 'tokenTotalSupply',
            type: 'u64'
          },
          {
            name: 'feeBasisPoints',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'lastWithdraw',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lastWithdrawTimestamp',
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'bondingCurve',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'virtualTokenReserves',
            type: 'u64'
          },
          {
            name: 'virtualSolReserves',
            type: 'u64'
          },
          {
            name: 'realTokenReserves',
            type: 'u64'
          },
          {
            name: 'realSolReserves',
            type: 'u64'
          },
          {
            name: 'tokenTotalSupply',
            type: 'u64'
          },
          {
            name: 'complete',
            type: 'bool'
          }
        ]
      }
    },
    {
      name: 'createEvent',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
            index: false
          },
          {
            name: 'symbol',
            type: 'string',
            index: false
          },
          {
            name: 'uri',
            type: 'string',
            index: false
          },
          {
            name: 'mint',
            type: 'pubkey',
            index: false
          },
          {
            name: 'bondingCurve',
            type: 'pubkey',
            index: false
          },
          {
            name: 'user',
            type: 'pubkey',
            index: false
          }
        ]
      }
    },
    {
      name: 'tradeEvent',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            type: 'pubkey',
            index: false
          },
          {
            name: 'solAmount',
            type: 'u64',
            index: false
          },
          {
            name: 'tokenAmount',
            type: 'u64',
            index: false
          },
          {
            name: 'isBuy',
            type: 'bool',
            index: false
          },
          {
            name: 'user',
            type: 'pubkey',
            index: false
          },
          {
            name: 'timestamp',
            type: 'i64',
            index: false
          },
          {
            name: 'virtualSolReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'virtualTokenReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'realSolReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'realTokenReserves',
            type: 'u64',
            index: false
          }
        ]
      }
    },
    {
      name: 'completeEvent',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'pubkey',
            index: false
          },
          {
            name: 'mint',
            type: 'pubkey',
            index: false
          },
          {
            name: 'bondingCurve',
            type: 'pubkey',
            index: false
          },
          {
            name: 'timestamp',
            type: 'i64',
            index: false
          }
        ]
      }
    },
    {
      name: 'setParamsEvent',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'feeRecipient',
            type: 'pubkey',
            index: false
          },
          {
            name: 'initialVirtualTokenReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'initialVirtualSolReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'initialRealTokenReserves',
            type: 'u64',
            index: false
          },
          {
            name: 'tokenTotalSupply',
            type: 'u64',
            index: false
          },
          {
            name: 'feeBasisPoints',
            type: 'u64',
            index: false
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: 'NotAuthorized',
      msg: 'The given account is not authorized to execute this instruction.'
    },
    {
      code: 6001,
      name: 'AlreadyInitialized',
      msg: 'The program is already initialized.'
    },
    {
      code: 6002,
      name: 'TooMuchSolRequired',
      msg: 'slippage: Too much SOL required to buy the given amount of tokens.'
    },
    {
      code: 6003,
      name: 'TooLittleSolReceived',
      msg: 'slippage: Too little SOL received to sell the given amount of tokens.'
    },
    {
      code: 6004,
      name: 'MintDoesNotMatchBondingCurve',
      msg: 'The mint does not match the bonding curve.'
    },
    {
      code: 6005,
      name: 'BondingCurveComplete',
      msg: 'The bonding curve has completed and liquidity migrated to raydium.'
    },
    {
      code: 6006,
      name: 'BondingCurveNotComplete',
      msg: 'The bonding curve has not completed.'
    },
    {
      code: 6007,
      name: 'NotInitialized',
      msg: 'The program is not initialized.'
    },
    {
      code: 6008,
      name: 'WithdrawTooFrequent',
      msg: 'Withdraw too frequent'
    }
  ]
};
