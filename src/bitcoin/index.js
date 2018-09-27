/* eslint-disable no-await-in-loop, no-constant-condition */
import bitcoin from 'bitcoinjs-lib';
import coinSelect from 'coinselect';
import { find, range } from 'lodash';
import typeforce from 'typeforce';

import HDWallet from '../hdWallet';
import * as apiServices from '../apiServices';
import { testnetConfig, mainnetConfig } from './config';
import { GAP_LIMIT, MAX_ACCOUNT_INDEX } from '../constants';

const getNetwork = testnet => (testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);

/**
 * Default we set testNet to true.
 * Need to be explicitly passed false in order to access mainnet
 * @class BitcoinHDWallet
 * @extends {HDWallet}
 */
class BitcoinHDWallet extends HDWallet {
  constructor({ mnemonics, testnet = true }) {
    typeforce('String', mnemonics);
    typeforce('Boolean', testnet);

    const {
      code, coinType, name, units, apis,
    } = testnet ? testnetConfig : mainnetConfig;
    const network = getNetwork(testnet);
    super({ mnemonics, network, coinType });

    this.code = code;
    this.name = name;
    this.units = units;
    this.apis = apis;
    this.network = network;
  }

  /**
   * helper method for satoshi to bitcoin conversion
   * @memberof BitcoinHDWallet
   */
  convertSatoshisToBitcoins = (satoshis) => {
    typeforce('Number', satoshis);

    return satoshis / this.units.value;
  };

  convertBitcoinsToSatoshis = (btc) => {
    typeforce('Number', btc);

    return Math.round(btc * this.units.value);
  };

  /**
   * Get addressNode from HDWallet base class implementation
   * Generate wallet address from addressNode for bitcoin and family
   * @memberof BitcoinHDWallet
   */
  generateAddress = (addressNode) => {
    typeforce('Object', addressNode);

    const wif = addressNode.toWIF();
    const keyPair = bitcoin.ECPair.fromWIF(wif, this.network);
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });
    return address;
  };

  /**
   * Utility function to generate multiple addresses
   * @memberof BitcoinHDWallet
   * @private
   */
  generateMultipleAddresses = ({
    startAddressIndex,
    endAddressIndex,
    accountNode,
    accountIndex,
    changeIndex,
  }) => range(startAddressIndex, endAddressIndex).map((index) => {
    typeforce('Number', startAddressIndex);
    typeforce('Number', endAddressIndex);
    typeforce('Object', accountNode);
    typeforce('Number', accountIndex);
    typeforce('Number', changeIndex);

    const { addressNode, derivationPath, path } = this.getAddressNode({
      accountNode,
      accountIndex,
      changeIndex,
      addressIndex: index,
    });

    const address = this.generateAddress(addressNode);
    return {
      address,
      path,
      derivationPath,
    };
  });

  /**
   * Utility function to get multiple addresses info from blockchain.info
   * @memberof BitcoinHDWallet
   * @private
   */
  getMultiAddressInfo = async (addresses) => {
    typeforce(['Object'], addresses);

    const { success, data, error } = await apiServices.get(
      `${this.apis.addressesInfo}?active=${addresses.map(a => a.address).join('|')}`,
    );
    if (!success) {
      throw new Error(error);
    }
    return data;
  };

  /**
   * Utility function to update account tree summary (balance, txs, totalRecieved, totalSent)
   * @memberof BitcoinHDWallet
   * @private
   */
  updateAccountTreeSummary = ({ accountTree, accountPublicKey, remoteData }) => {
    typeforce('Object', accountTree);
    typeforce('String', accountPublicKey);
    typeforce('Object', remoteData);

    return {
      ...accountTree,
      [accountPublicKey]: {
        ...accountTree[accountPublicKey],
        txs: accountTree[accountPublicKey].txs + remoteData.wallet.n_tx,
        balance: accountTree[accountPublicKey].balance + remoteData.wallet.final_balance,
        totalReceived:
          accountTree[accountPublicKey].totalReceived + remoteData.wallet.total_received,
        totalSent: accountTree[accountPublicKey].totalSent + remoteData.wallet.total_sent,
      },
    };
  };

  /**
   * Utility function to update account tree addresses
   * @memberof BitcoinHDWallet
   * @private
   */
  updateAccountTreeAddresses = ({
    accountTree,
    accountPublicKey,
    addresses,
    addressesKey,
    remoteData,
  }) => {
    typeforce('Object', accountTree);
    typeforce('String', accountPublicKey);
    typeforce(['Object'], addresses);
    typeforce('String', addressesKey);
    typeforce('Object', remoteData);

    let lastAddressIndex = -1;
    const newAccountTree = { ...accountTree };
    addresses.forEach((addressObj, index) => {
      const addressInfo = find(remoteData.addresses, {
        address: addressObj.address,
      });
      if (addressInfo.n_tx > 0) {
        lastAddressIndex = index;
      }

      if (
        !find(newAccountTree[accountPublicKey][addressesKey], {
          address: addressObj.address,
        })
      ) {
        newAccountTree[accountPublicKey][addressesKey].push({
          ...addressInfo,
          ...addressObj,
        });
      }
    });

    return {
      accountTree: newAccountTree,
      lastAddressIndex,
    };
  };

  /**
   * @memberof BitcoinHDWallet
   * @private
   */
  scan = async (extensive = false, isNew = true) => {
    typeforce('Boolean', extensive);

    let currAccountIndex = null;
    let accountTree = {};

    for (let accountIndex = 0; accountIndex <= MAX_ACCOUNT_INDEX; accountIndex += 1) {
      if (currAccountIndex !== null) {
        break;
      }

      const {
        accountNode,
        accountPublicKey,
        derivationPath: accountDerivationPath,
        path: accountPath,
      } = this.getAccountNode({
        accountIndex,
      });

      // initalise new accountIndex address holder
      accountTree = {
        ...accountTree,
        [accountPublicKey]: {
          txs: 0,
          balance: 0,
          totalReceived: 0,
          totalSent: 0,
          key: accountPublicKey,
          path: accountPath,
          derivationPath: accountDerivationPath,
          externalAddresses: [],
          internalAddresses: [],
        },
      };

      let addressIndex = 0;
      let accountHasTxns = false;
      while (true) {
        // internal
        let internalAddresses = [];
        let fetchedInternalData = {};
        if (extensive) {
          internalAddresses = this.generateMultipleAddresses({
            startAddressIndex: addressIndex,
            endAddressIndex: addressIndex + GAP_LIMIT,
            accountNode,
            accountIndex,
            changeIndex: 1,
          });

          fetchedInternalData = await this.getMultiAddressInfo(internalAddresses);
          accountTree = this.updateAccountTreeSummary({
            accountTree,
            accountPublicKey,
            remoteData: fetchedInternalData,
          });
        }

        // external
        const externalAddresses = this.generateMultipleAddresses({
          startAddressIndex: addressIndex,
          endAddressIndex: addressIndex + GAP_LIMIT,
          accountNode,
          accountIndex,
          changeIndex: 0,
        });
        const fetchedExternalData = await this.getMultiAddressInfo(externalAddresses);
        accountTree = this.updateAccountTreeSummary({
          accountTree,
          accountPublicKey,
          remoteData: fetchedExternalData,
        });

        if (fetchedExternalData.txs.length === 0) {
          // this set of 20 addresses do not have any txn associated with them
          if (!accountHasTxns) {
            currAccountIndex = accountIndex;
          }
          break;
        } else {
          accountHasTxns = true;
          // find last address index having n_tx > 0 and
          // store unique external address obj in traversed addresses obj
          const { accountTree: newAccountTree, lastAddressIndex } = this.updateAccountTreeAddresses(
            {
              accountTree,
              accountPublicKey,
              addresses: externalAddresses,
              addressesKey: 'externalAddresses',
              remoteData: fetchedExternalData,
            },
          );
          accountTree = newAccountTree;
          addressIndex += lastAddressIndex + 1;

          // internal addresses chain
          if (extensive) {
            // store unique internal address obj in traversed addresses obj
            const { accountTree: newAccountTreeAlt } = this.updateAccountTreeAddresses({
              accountTree,
              accountPublicKey,
              addresses: internalAddresses,
              addressesKey: 'internalAddresses',
              remoteData: fetchedInternalData,
            });
            accountTree = newAccountTreeAlt;
          }
        }
      }
    }

    // calculate balance, txs, totalReceived, totalSent at global level (for cointTree)
    let balance = 0;
    let txs = 0;
    let totalReceived = 0;
    let totalSent = 0;

    Object.keys(accountTree).forEach((accountKey) => {
      const accountObj = accountTree[accountKey];
      balance += accountObj.balance;
      txs += accountObj.txs;
      totalReceived += accountObj.totalReceived;
      totalSent += accountObj.totalSent;
    });

    let _currAccountIndex = currAccountIndex;
    if (isNew) {
      if (currAccountIndex !== 0) {
        _currAccountIndex -= 1;
      }
    }

    const { accountPublicKey: currAccountPublicKey } = this.getAccountNode({
      accountIndex: _currAccountIndex,
    });

    return {
      currAccountIndex: _currAccountIndex,
      currAccountPublicKey,
      accountTree,
      balance,
      txs,
      totalReceived,
      totalSent,
    };
  };

  getCurrentReceiveAddress = (coinTree) => {
    typeforce('Object', coinTree);

    const { currAccountIndex, currAccountPublicKey, accountTree } = coinTree;
    const { externalAddresses } = accountTree[currAccountPublicKey];
    const { addressNode, derivationPath, path } = this.getAddressNode({
      accountIndex: currAccountIndex,
      changeIndex: 0,
      addressIndex: externalAddresses.length,
    });

    const address = this.generateAddress(addressNode);
    return {
      address,
      path,
      derivationPath,
    };
  };

  getCurrentChangeAddress = (coinTree) => {
    typeforce('Object', coinTree);

    const { currAccountIndex, currAccountPublicKey, accountTree } = coinTree;
    const { internalAddresses } = accountTree[currAccountPublicKey];
    const { addressNode, derivationPath, path } = this.getAddressNode({
      accountIndex: currAccountIndex,
      changeIndex: 1,
      addressIndex: internalAddresses.length,
    });

    const address = this.generateAddress(addressNode);
    return {
      address,
      path,
      derivationPath,
    };
  };

  /**
   * This method must be called whenever you need to recreate full coinTree
   * It returns the full coinTree
   * @memberof BitcoinHDWallet
   */
  runFullScan = (isNew = true) => this.scan(true, isNew);

  /**
   * This method must be called when them master seed is imported from an external source
   * It returns the current accountIndex
   * @memberof BitcoinHDWallet
   */
  runAccountDiscovery = async () => {
    const coinTree = await this.scan(false);
    return coinTree.currAccountIndex;
  };

  /**
   * Utility function for getting final balance across multiple xpubs
   * To be used in case you need to get wallet balance for bitcoin from across all accounts
   * @memberof BitcoinHDWallet
   */
  getBalanceForAccountXpubs = async (xpubs = []) => {
    typeforce(['String'], xpubs);

    if (xpubs.length === 0) return 0;
    const { success, data, error } = await apiServices.get(
      `${this.apis.addressesInfo}?active=${xpubs.join('|')}`,
    );
    if (!success) {
      throw new Error(error);
    }
    return data.wallet.final_balance;
  };

  /**
   * Converts provided fiatValue to equivalent satoshis
   * @memberof BitcoinHDWallet
   */
  convertFiatToBTC = async ({ fiatCode, fiatValue }) => {
    typeforce('String', fiatCode);
    typeforce('Number', fiatValue);

    const { success, data, error } = await apiServices.get(
      `${this.apis.toBTC}?currency=${fiatCode}&value=${fiatValue}`,
    );

    if (!success) {
      throw new Error(error);
    }
    return {
      bitcoins: data,
      satoshis: this.convertBitcoinsToSatoshis(data),
    };
  };

  /**
   * Converts provided satoshis to equivalent fiat
   * @memberof BitcoinHDWallet
   */
  convertBTCToFiat = async ({ fiatCode, satoshis }) => {
    typeforce('String', fiatCode);
    typeforce('Number', satoshis);

    const { success, data, error } = await apiServices.get(
      `${this.apis.toBTC}?currency=${fiatCode}&value=1`,
    );

    if (!success) {
      throw new Error(error);
    }

    const fiatValue = satoshis / this.convertBitcoinsToSatoshis(data);
    return {
      fiat: fiatValue,
      [fiatCode]: fiatValue,
    };
  };

  /**
   * Get mining fee rate
   * variant can be one of "fastestFee", "halfHourFee", "hourFee"
   * Make sure to include appropriate fee rate while creating transaction
   * @memberof BitcoinHDWallet
   */
  getMiningFeeRate = async (variant = 'fastestFee') => {
    typeforce('String', variant);
    const variants = ['fastestFee', 'halfHourFee', 'hourFee'];
    if (!variants.includes(variant)) {
      throw new TypeError(`variant must be one of ${variants.join(', ')}`);
    }

    const { success, data, error } = await apiServices.get(this.apis.minigFee);
    if (!success) {
      throw new Error(error);
    }
    return data[variant];
  };
}

export default BitcoinHDWallet;
