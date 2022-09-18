"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DyDxConnector = void 0;
const v3_client_1 = require("@dydxprotocol/v3-client");
const axios_1 = require("@dydxprotocol/v3-client/build/src/lib/axios");
const core_1 = require("@quantform/core");
const ws_1 = require("ws");
const dydx_adapter_1 = require("./dydx-adapter");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
function subscriptionKey(channel, market) {
    return `${channel}:${market}`;
}
class DyDxConnector {
    constructor(options) {
        this.options = options;
        this.web3 = new Web3();
        this.emitter = new ws_1.EventEmitter();
        this.subscriptions = {};
        this.lastMessageTimestamp = 0;
        this.web3.eth.accounts.wallet.add((0, core_1.getEnvVar)('QF_DYDX_ETH_PRIVATE_KEY'));
        this.client = new v3_client_1.DydxClient(options.http, {
            web3: this.web3,
            networkId: options.networkId
        });
    }
    onboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const credentials = yield this.client.onboarding.recoverDefaultApiCredentials((0, core_1.getEnvVar)('QF_DYDX_ETH_ADDRESS'));
            this.client.apiKeyCredentials = credentials;
        });
    }
    dispose() {
        clearInterval(this.reconnectionTimeout);
        clearInterval(this.pingInterval);
        if (this.socket && this.socket.readyState == this.socket.OPEN) {
            this.socket.terminate();
            this.socket = undefined;
        }
    }
    getMarkets() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, core_1.retry)(() => this.client.public.getMarkets());
        });
    }
    getTrades(market, startingBeforeOrAt) {
        return this.client.public.getTrades({
            market: market,
            startingBeforeOrAt: new Date(startingBeforeOrAt).toISOString()
        });
    }
    account(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client.apiKeyCredentials) {
                throw new Error('you need to onboard first.');
            }
            const { account } = yield this.client.private.getAccount((0, core_1.getEnvVar)('QF_DYDX_ETH_ADDRESS'));
            const timestamp = new Date().toISOString();
            const signature = this.client.private.sign({
                requestPath: '/ws/accounts',
                method: axios_1.RequestMethod.GET,
                isoTimestamp: timestamp
            });
            this.emitter.on('v3_accounts', handler);
            this.subscribe({
                type: 'subscribe',
                channel: 'v3_accounts',
                accountNumber: account.accountNumber,
                apiKey: this.client.apiKeyCredentials.key,
                passphrase: this.client.apiKeyCredentials.passphrase,
                signature,
                timestamp
            });
        });
    }
    trades(market, handler) {
        this.emitter.on('v3_trades', it => {
            if (it.id == market) {
                handler(it);
            }
        });
        this.subscribe({
            type: 'subscribe',
            channel: 'v3_trades',
            id: market,
            includeOffsets: true
        });
    }
    orderbook(market, handler) {
        this.emitter.on('v3_orderbook', it => {
            if (it.id == market) {
                handler(it);
            }
        });
        this.subscribe({
            type: 'subscribe',
            channel: 'v3_orderbook',
            id: market,
            includeOffsets: true
        });
    }
    reconnect() {
        var _a;
        if (this.reconnectionTimeout) {
            return;
        }
        core_1.Logger.error(dydx_adapter_1.DYDX_ADAPTER_NAME, `socket connection down, reconnecting in ${DyDxConnector.RECONNECTION_TIMEOUT}ms.`);
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.close();
        this.socket = undefined;
        this.reconnectionTimeout = setTimeout(() => {
            this.reconnectionTimeout = undefined;
            this.tryEnsureSocketConnection();
        }, DyDxConnector.RECONNECTION_TIMEOUT);
    }
    tryEnsureSocketConnection() {
        if (this.socket || this.reconnectionTimeout) {
            return;
        }
        this.socket = new ws_1.WebSocket(this.options.ws);
        this.socket
            .on('close', () => this.reconnect())
            .on('error', () => this.reconnect())
            .on('pong', () => (this.lastMessageTimestamp = (0, core_1.now)()))
            .on('ping', () => (this.lastMessageTimestamp = (0, core_1.now)()))
            .on('open', () => {
            core_1.Logger.info(dydx_adapter_1.DYDX_ADAPTER_NAME, `socket connected!`);
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
            }
            this.lastMessageTimestamp = (0, core_1.now)();
            this.pingInterval = setInterval(() => {
                if (this.socket && this.socket.readyState == ws_1.WebSocket.OPEN) {
                    this.socket.ping();
                }
            }, DyDxConnector.PING_TIMEOUT);
            Object.values(this.subscriptions).forEach(it => { var _a; return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(it)); });
        })
            .on('message', it => {
            const timestamp = (0, core_1.now)();
            if (this.lastMessageTimestamp + DyDxConnector.PING_TIMEOUT * 2 < timestamp) {
                this.reconnect();
            }
            else {
                this.lastMessageTimestamp = timestamp;
                const payload = JSON.parse(it.toString());
                this.emitter.emit(payload.channel, payload);
            }
        });
    }
    subscribe(subscription) {
        var _a;
        const key = subscriptionKey(subscription.channel, subscription.market);
        if (key in this.subscriptions) {
            throw new Error(`Already subscribed for ${subscription.channel} on ${subscription.market}`);
        }
        this.tryEnsureSocketConnection();
        this.subscriptions[key] = subscription;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.on('open', () => { var _a; return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(subscription)); });
    }
}
exports.DyDxConnector = DyDxConnector;
DyDxConnector.RECONNECTION_TIMEOUT = 1000;
DyDxConnector.PING_TIMEOUT = 1000 * 5;
