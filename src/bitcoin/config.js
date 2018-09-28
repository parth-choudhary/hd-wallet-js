export const testnetConfig = {
  code: 'TEST',
  name: 'Testnet',
  coinType: 1,
  units: {
    label: 'satoshi',
    value: 100000000,
  },
  apis: {
    minigFee: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
    addressesInfo: 'https://testnet.blockchain.info/multiaddr',
    toBTC: 'https://blockchain.info/tobtc',
    addressesUTXOs: 'https://testnet.blockexplorer.com/api/addrs/{{addresses}}/utxo',
    broadCastTxn: 'https://testnet.blockexplorer.com/api/tx/send',

    queryTxn: 'https://testnet.blockexplorer.com/api/tx/',
    confirmedBalance: 'https://testnet.blockexplorer.com/api/addr/{{address}}/balance',
    unConfirmedBalance: 'https://testnet.blockexplorer.com/api/{{address}}/unconfirmedBalance',
  },
};

export const mainnetConfig = {
  code: 'BTC',
  name: 'Bitcoin',
  coinType: 0,
  units: {
    label: 'satoshi',
    value: 100000000,
  },
  apis: {
    minigFee: 'https://bitcoinfees.earn.com/api/v1/fees/recommended',
    addressesInfo: 'https://blockchain.info/multiaddr',
    toBTC: 'https://blockchain.info/tobtc',
    addressesUTXOs: 'https://testnet.blockexplorer.com/api/addrs/{{addresses}}/utxo',
    broadCastTxn: 'https://blockexplorer.com/api/tx/send',

    queryTxn: 'https://blockexplorer.com/api/tx/',
    confirmedBalance: 'https://blockexplorer.com/api/addr/{{address}}/balance',
    unConfirmedBalance: 'https://blockexplorer.com/api/{{address}}/unconfirmedBalance',
  },
};
