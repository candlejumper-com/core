import zip from 'lodash.zipobject'

const partialDepthTransform = (symbol, level, m) => ({
    symbol,
    level,
    lastUpdateId: m.lastUpdateId,
    bids: m.bids.map(b => zip(['price', 'quantity'], b)),
    asks: m.asks.map(a => zip(['price', 'quantity'], a)),
})

const futuresPartDepthTransform = (level, m) => ({
    level,
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const deliveryPartDepthTransform = (level, m) => ({
    level,
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    pair: m.ps,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const candleTransform = m => ({
    startTime: m.t,
    closeTime: m.T,
    firstTradeId: m.f,
    lastTradeId: m.L,
    open: m.o,
    high: m.h,
    low: m.l,
    close: m.c,
    volume: m.v,
    trades: m.n,
    interval: m.i,
    isFinal: m.x,
    quoteVolume: m.q,
    buyVolume: m.V,
    quoteBuyVolume: m.Q,
})

const deliveryCandleTransform = m => ({
    startTime: m.t,
    closeTime: m.T,
    firstTradeId: m.f,
    lastTradeId: m.L,
    open: m.o,
    high: m.h,
    low: m.l,
    close: m.c,
    volume: m.v,
    trades: m.n,
    interval: m.i,
    isFinal: m.x,
    baseVolume: m.q,
    buyVolume: m.V,
    baseBuyVolume: m.Q,
})

const bookTickerTransform = m => ({
    updateId: m.u,
    symbol: m.s,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A,
})

const miniTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    curDayClose: m.c,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
})

const deliveryMiniTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    pair: m.ps,
    curDayClose: m.c,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeBase: m.q,
})

const tickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    prevDayClose: m.x,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    bestBid: m.b,
    bestBidQnt: m.B,
    bestAsk: m.a,
    bestAskQnt: m.A,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const futuresTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeQuote: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const deliveryTickerTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    pair: m.ps,
    priceChange: m.p,
    priceChangePercent: m.P,
    weightedAvg: m.w,
    curDayClose: m.c,
    closeTradeQuantity: m.Q,
    open: m.o,
    high: m.h,
    low: m.l,
    volume: m.v,
    volumeBase: m.q,
    openTime: m.O,
    closeTime: m.C,
    firstTradeId: m.F,
    lastTradeId: m.L,
    totalTrades: m.n,
})

const aggTradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    timestamp: m.T,
    symbol: m.s,
    price: m.p,
    quantity: m.q,
    isBuyerMaker: m.m,
    wasBestPrice: m.M,
    aggId: m.a,
    firstId: m.f,
    lastId: m.l,
})

const futuresAggTradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    aggId: m.a,
    price: m.p,
    quantity: m.q,
    firstId: m.f,
    lastId: m.l,
    timestamp: m.T,
    isBuyerMaker: m.m,
})

const futuresLiqsTransform = m => ({
    symbol: m.s,
    price: m.p,
    origQty: m.q,
    lastFilledQty: m.l,
    accumulatedQty: m.z,
    averagePrice: m.ap,
    status: m.X,
    timeInForce: m.f,
    type: m.o,
    side: m.S,
    time: m.T,
})

const tradesTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    tradeTime: m.T,
    symbol: m.s,
    price: m.p,
    quantity: m.q,
    isBuyerMaker: m.m,
    maker: m.M,
    tradeId: m.t,
    buyerOrderId: m.b,
    sellerOrderId: m.a,
})

export const userTransforms = {
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#balance-update
    balanceUpdate: m => ({
        asset: m.a,
        balanceDelta: m.d,
        clearTime: m.T,
        eventTime: m.E,
        eventType: 'balanceUpdate',
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountInfo: m => ({
        eventType: 'account',
        eventTime: m.E,
        makerCommissionRate: m.m,
        takerCommissionRate: m.t,
        buyerCommissionRate: m.b,
        sellerCommissionRate: m.s,
        canTrade: m.T,
        canWithdraw: m.W,
        canDeposit: m.D,
        lastAccountUpdate: m.u,
        balances: m.B.reduce((out, cur) => {
            out[cur.a] = { available: cur.f, locked: cur.l }
            return out
        }, {}),
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#account-update
    outboundAccountPosition: m => ({
        balances: m.B.map(({ a, f, l }) => ({ asset: a, free: f, locked: l })),
        eventTime: m.E,
        eventType: 'outboundAccountPosition',
        lastAccountUpdate: m.u,
    }),
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md#order-update
    executionReport: m => ({
        eventType: 'executionReport',
        eventTime: m.E,
        symbol: m.s,
        newClientOrderId: m.c,
        originalClientOrderId: m.C,
        side: m.S,
        orderType: m.o,
        timeInForce: m.f,
        quantity: m.q,
        price: m.p,
        executionType: m.x,
        stopPrice: m.P,
        trailingDelta: m.d,
        icebergQuantity: m.F,
        orderStatus: m.X,
        orderRejectReason: m.r,
        orderId: m.i,
        orderTime: m.T,
        lastTradeQuantity: m.l,
        totalTradeQuantity: m.z,
        priceLastTrade: m.L,
        commission: m.n,
        commissionAsset: m.N,
        tradeId: m.t,
        isOrderWorking: m.w,
        isBuyerMaker: m.m,
        creationTime: m.O,
        totalQuoteTradeQuantity: m.Z,
        orderListId: m.g,
        quoteOrderQuantity: m.Q,
        lastQuoteTransacted: m.Y,
        trailingTime: m.D,
    }),
    listStatus: m => ({
        eventType: 'listStatus',
        eventTime: m.E,
        symbol: m.s,
        orderListId: m.g,
        contingencyType: m.c,
        listStatusType: m.l,
        listOrderStatus: m.L,
        listRejectReason: m.r,
        listClientOrderId: m.C,
        transactionTime: m.T,
        orders: m.O.map(o => ({
            symbol: o.s,
            orderId: o.i,
            clientOrderId: o.c,
        })),
    }),
}

const futuresUserTransforms = {
    // https://binance-docs.github.io/apidocs/futures/en/#close-user-data-stream-user_stream
    listenKeyExpired: function USER_DATA_STREAM_EXPIRED(m) {
        return {
            eventTime: m.E,
            eventType: 'USER_DATA_STREAM_EXPIRED',
        }
    },
    // https://binance-docs.github.io/apidocs/futures/en/#event-margin-call
    MARGIN_CALL: m => ({
        eventTime: m.E,
        crossWalletBalance: m.cw,
        eventType: 'MARGIN_CALL',
        positions: m.p.map(cur => ({
            symbol: cur.s,
            positionSide: cur.ps,
            positionAmount: cur.pa,
            marginType: cur.mt,
            isolatedWallet: cur.iw,
            markPrice: cur.mp,
            unrealizedPnL: cur.up,
            maintenanceMarginRequired: cur.mm,
        })),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-balance-and-position-update
    ACCOUNT_UPDATE: m => ({
        eventTime: m.E,
        transactionTime: m.T,
        eventType: 'ACCOUNT_UPDATE',
        eventReasonType: m.a.m,
        balances: m.a.B.map(b => ({
            asset: b.a,
            walletBalance: b.wb,
            crossWalletBalance: b.cw,
            balanceChange: b.bc,
        })),
        positions: m.a.P.map(p => ({
            symbol: p.s,
            positionAmount: p.pa,
            entryPrice: p.ep,
            accumulatedRealized: p.cr,
            unrealizedPnL: p.up,
            marginType: p.mt,
            isolatedWallet: p.iw,
            positionSide: p.ps,
        })),
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-order-update
    ORDER_TRADE_UPDATE: m => ({
        eventType: 'ORDER_TRADE_UPDATE',
        eventTime: m.E,
        transactionTime: m.T,
        symbol: m.o.s,
        clientOrderId: m.o.c,
        side: m.o.S,
        orderType: m.o.o,
        timeInForce: m.o.f,
        quantity: m.o.q,
        price: m.o.p,
        averagePrice: m.o.ap,
        stopPrice: m.o.sp,
        executionType: m.o.x,
        orderStatus: m.o.X,
        orderId: m.o.i,
        lastTradeQuantity: m.o.l,
        totalTradeQuantity: m.o.z,
        priceLastTrade: m.o.L,
        commissionAsset: m.o.N,
        commission: m.o.n,
        orderTime: m.o.T,
        tradeId: m.o.t,
        bidsNotional: m.o.b,
        asksNotional: m.o.a,
        isMaker: m.o.m,
        isReduceOnly: m.o.R,
        workingType: m.o.wt,
        originalOrderType: m.o.ot,
        positionSide: m.o.ps,
        closePosition: m.o.cp,
        activationPrice: m.o.AP,
        callbackRate: m.o.cr,
        realizedProfit: m.o.rp,
    }),
    // https://binance-docs.github.io/apidocs/futures/en/#event-account-configuration-update-previous-leverage-update
    ACCOUNT_CONFIG_UPDATE: m => ({
        eventType: 'ACCOUNT_CONFIG_UPDATE',
        eventTime: m.E,
        transactionTime: m.T,
        type: m.ac ? 'ACCOUNT_CONFIG' : 'MULTI_ASSETS',
        ...(m.ac
            ? {
                symbol: m.ac.s,
                leverage: m.ac.l,
            }
            : {
                multiAssets: m.ai.j,
            }),
    }),
}

const futuresAllMarkPricesTransform = m =>
    m.map(x => ({
        eventType: x.e,
        eventTime: x.E,
        symbol: x.s,
        markPrice: x.p,
        indexPrice: x.i,
        settlePrice: x.P,
        fundingRate: x.r,
        nextFundingRate: x.T,
    }))

const depthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const futuresDepthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})

const deliveryDepthTransform = m => ({
    eventType: m.e,
    eventTime: m.E,
    transactionTime: m.T,
    symbol: m.s,
    pair: m.ps,
    firstUpdateId: m.U,
    finalUpdateId: m.u,
    prevFinalUpdateId: m.pu,
    bidDepth: m.b.map(b => zip(['price', 'quantity'], b)),
    askDepth: m.a.map(a => zip(['price', 'quantity'], a)),
})