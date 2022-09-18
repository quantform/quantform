"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRejectedEvent = exports.OrderCancelFailedEvent = exports.OrderCanceledEvent = exports.OrderCancelingEvent = exports.OrderFilledEvent = exports.OrderPendingEvent = exports.OrderNewEvent = exports.OrderLoadEvent = void 0;
const error_1 = require("./error");
const store_state_1 = require("./store-state");
/**
 * Patches a store with an existing pending order.
 * No store changing events are propagated.
 */
class OrderLoadEvent {
    constructor(order, timestamp) {
        this.order = order;
        this.timestamp = timestamp;
    }
    handle(state) {
        this.order.timestamp = this.timestamp;
        const orderByInstrument = state.order.tryGetOrSet(this.order.instrument.id, () => new store_state_1.InnerSet(this.order.instrument.id));
        orderByInstrument.upsert(this.order);
    }
}
exports.OrderLoadEvent = OrderLoadEvent;
class OrderNewEvent {
    constructor(order, timestamp) {
        this.order = order;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        if (this.order.state != 'NEW') {
            throw (0, error_1.orderInvalidStateError)(this.order.state, ['NEW']);
        }
        this.order.createdAt = this.timestamp;
        this.order.timestamp = this.timestamp;
        const orderByInstrument = state.order.tryGetOrSet(this.order.instrument.id, () => new store_state_1.InnerSet(this.order.instrument.id));
        orderByInstrument.upsert(this.order);
        changes.commit(this.order);
    }
}
exports.OrderNewEvent = OrderNewEvent;
class OrderPendingEvent {
    constructor(id, instrument, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state != 'NEW') {
            throw (0, error_1.orderInvalidStateError)(order.state, ['NEW']);
        }
        order.state = 'PENDING';
        order.timestamp = this.timestamp;
        changes.commit(order);
    }
}
exports.OrderPendingEvent = OrderPendingEvent;
class OrderFilledEvent {
    constructor(id, instrument, averageExecutionRate, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.averageExecutionRate = averageExecutionRate;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state != 'PENDING' && order.state != 'CANCELING') {
            throw (0, error_1.orderInvalidStateError)(order.state, ['PENDING', 'CANCELING']);
        }
        order.state = 'FILLED';
        order.timestamp = this.timestamp;
        order.quantityExecuted = order.quantity;
        order.averageExecutionRate = this.averageExecutionRate;
        changes.commit(order);
    }
}
exports.OrderFilledEvent = OrderFilledEvent;
class OrderCancelingEvent {
    constructor(id, instrument, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state == 'CANCELING' || order.state == 'CANCELED') {
            return;
        }
        if (order.state != 'PENDING') {
            throw (0, error_1.orderInvalidStateError)(order.state, ['PENDING']);
        }
        order.state = 'CANCELING';
        order.timestamp = this.timestamp;
        changes.commit(order);
    }
}
exports.OrderCancelingEvent = OrderCancelingEvent;
class OrderCanceledEvent {
    constructor(id, instrument, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state == 'CANCELED') {
            return;
        }
        if (order.state != 'CANCELING') {
            throw (0, error_1.orderInvalidStateError)(order.state, ['CANCELING']);
        }
        order.state = 'CANCELED';
        order.timestamp = this.timestamp;
        changes.commit(order);
    }
}
exports.OrderCanceledEvent = OrderCanceledEvent;
class OrderCancelFailedEvent {
    constructor(id, instrument, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state != 'CANCELING') {
            return;
        }
        order.state = 'PENDING';
        order.timestamp = this.timestamp;
        changes.commit(order);
    }
}
exports.OrderCancelFailedEvent = OrderCancelFailedEvent;
class OrderRejectedEvent {
    constructor(id, instrument, timestamp) {
        this.id = id;
        this.instrument = instrument;
        this.timestamp = timestamp;
    }
    handle(state, changes) {
        const order = state.order
            .tryGetOrSet(this.instrument.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        })
            .tryGetOrSet(this.id, () => {
            throw (0, error_1.orderNotFoundError)(this.id);
        });
        if (order.state != 'NEW') {
            throw (0, error_1.orderInvalidStateError)(order.state, ['NEW']);
        }
        order.state = 'REJECTED';
        order.timestamp = this.timestamp;
        changes.commit(order);
    }
}
exports.OrderRejectedEvent = OrderRejectedEvent;
