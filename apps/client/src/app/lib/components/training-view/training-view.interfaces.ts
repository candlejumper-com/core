export interface Graph {
  data: GraphData[]
  layout: GraphLayout
}

export interface GraphData {
  x: Date[]
  y: number[][]
  name: string
}

export interface GraphLayout {
  height?: number
  title?: string
  autosize?: boolean
  margin: any
}
