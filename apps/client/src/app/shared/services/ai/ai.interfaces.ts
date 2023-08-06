export interface ITensorflowRunResult {
    data: {
      inputs: {
        predX: number[][];
        predY: Float32Array;
        sma: number[][];
      }
    }
    stats: {
      startTime: number
      totalTime: number
    }
  }