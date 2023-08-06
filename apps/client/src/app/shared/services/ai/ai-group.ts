import { TensorflowInstance } from "../tensorflow/instance/tensorflow.instance"
import { ITensorflowOptions } from "../tensorflow/tensorflow.interfaces"

export class AIGroup {
    id: number

    instances: TensorflowInstance[]

    options: ITensorflowOptions
    
}