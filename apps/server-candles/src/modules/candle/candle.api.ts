import { RouteBase, Routes, SymbolManager } from "@candlejumper/shared"
import { ApiServer } from "../../system/system.api"

@Routes({})
export class CandleApi extends RouteBase {
  constructor(
    private apiServer: ApiServer,
    private symbolManager: SymbolManager,
  ) {
    super()
  }

  async onInit() {
    this.apiServer.app.post('/api/candles', async (req, res) => {
      try {
        const query = req.query as any
        const pairs = req.body as any
        const from = parseInt(query.from, 10) || 0
        const count = parseInt(query.count, 10)
        const data = {}
        for (let i = 0, len = pairs.length; i < len; i++) {
          const pair = pairs[i]
          const symbol = this.symbolManager.get(pair.name)

          if (!symbol) {
            continue
          }

          const interval = pair.interval
        //   const candles = await this.candleManager.getFromDB(symbol, interval, count)

        //   data[symbol.name] = data[symbol.name] || {}
        //   data[symbol.name][interval] = candles
        }

        res.send(data)
      } catch (error) {
        console.error(error)
        res.status(500).send(error)
      }
    })

    this.apiServer.app.get('/api-candles/candles/:symbol/:interval', async (req, res) => {
      try {
        const params = req.params
        const query = req.query as any
        const count = parseInt(query.count, 10) || 1000
        // const candles = this.system.candleManager.get(params.symbol, params.interval, count)

        // const candles = await this.candleManager.getFromDB({name: params.symbol}, params.interval, count)
        // res.send(candles)
      } catch (error) {
        console.error(error)
        res.status(500).send(error)
      }
    })

  }
}
