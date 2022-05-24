import { SNP } from "./types";
import { generateSpikingVector } from "./generateSpikingVector";
import { generateSpikingMatrix } from "./generateSpikingMatrix";
import { getConfigGPU } from "./getConfigGPU";
import { getConfigGPU_nd } from "./getConfigGPU_nd";
import { getConfigCPU } from "./getConfigCPU";

function isComputationNotDone(spikingVector: SNP.SpikingVector) {
    for (let i = 0; i < spikingVector.length; i++) {
        if (spikingVector[i] !== 0) {
            return true
        }
    }

    return false
}

export function getFinalConfig(initialConfig: SNP.Config, ruleExpVector: [number, RegExp][], spikingTransitionMatrix: SNP.SpikingTransitionMatrix, isGPU: boolean = true, maxRuns: number = 100) {
    let config = initialConfig
    let spikingVector: SNP.SpikingVector = generateSpikingVector(config, ruleExpVector)
    let iter = 0;

    while (iter < 999 && isComputationNotDone(spikingVector)) {
        if (isGPU) {
            config = getConfigGPU(config, spikingVector, spikingTransitionMatrix)
        } else {
            config = getConfigCPU(config, spikingVector, spikingTransitionMatrix)
        }
        spikingVector = generateSpikingVector(config, ruleExpVector)
        iter += 1
    }
    return config
}


export function getFinalConfig_nd(config: SNP.Config, ruleExpVector: [number, RegExp][], spikingTransitionMatrix: number[],  spikingTransitionMatrix_2D:number[][], isGPU: boolean = true) {
    let iter = 0, spikingMatrix
  
    let Q = []
    Q.push(config)
    let start = 0, end = Q.length, nextConfig
    while(iter < 5){
      for(let starting = start; starting < end; starting++){
        config = Q[starting]
        spikingMatrix = generateSpikingMatrix(config, ruleExpVector)
        if(isGPU){
            Q = Q.concat(getConfigGPU_nd(config, spikingMatrix, spikingTransitionMatrix))
        }else{
            for(let k = 0; k<spikingMatrix.length; k++){
              nextConfig = getConfigCPU(config, spikingMatrix[k], spikingTransitionMatrix_2D)

              Q.push(nextConfig)
            }
        }

      }
      start = end
      end = Q.length
  
      iter++
    }
  
    for(let j = start; j<end; j++){
      console.log("C4: " + Q[j])
    }

    return Q
}