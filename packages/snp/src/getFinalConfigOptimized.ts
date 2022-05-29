import { SNP } from "./types";
import { PAD } from './constants'
import { generateOptimizedSpikingVector } from "./generateOptimizedSpikingVector";
import { getConfigGPUOptimized, getConfigGPUOptimized_nd } from "./getConfigGPUOptimized";
import { getConfigCPUOptimized } from "./getConfigCPUOptimized";
import { generateSpikingMatrix_Sparse } from "./generateSpikingMatrix_Sparse";

function isComputationNotDone(spikingVector: SNP.SpikingVector) {
    for (let i = 0; i < spikingVector.length; i++) {
        if (spikingVector[i] !== PAD) {
            return true
        }
    }

    return false
}

export function getFinalConfigOptimized(initialConfig: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[], ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix, isGPU: boolean = true, maxRuns: number = 100) {
    let config = initialConfig
    let spikingVector: SNP.SpikingVector = generateOptimizedSpikingVector(config, neuronRuleMapVector, ruleExpVector)

    let iter = 0;

    while (iter < maxRuns && isComputationNotDone(spikingVector)) {
        if (isGPU) {
            config = getConfigGPUOptimized(config, spikingVector, ruleVector, synapseMatrix)
        } else {
            config = getConfigCPUOptimized(config, spikingVector, ruleVector, synapseMatrix)
        }
        spikingVector = generateOptimizedSpikingVector(config, neuronRuleMapVector, ruleExpVector)
    }
    return config
}


export function getFinalConfigOptimized_nd(config: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[], ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix, isGPU: boolean = true) {
    
    let iter = 0, spikingMatrix
    
    let Q = []
    Q.push(config)
    let start = 0, end = Q.length, nextConfig
    while(iter < 5){
        for(let starting = start; starting < end; starting++){
            config = Q[starting]
            spikingMatrix = generateSpikingMatrix_Sparse(config, neuronRuleMapVector, ruleExpVector)

            if(isGPU){
                Q = Q.concat(getConfigGPUOptimized_nd(config, spikingMatrix, ruleVector, synapseMatrix))

            }else{
                for(let k = 0; k<spikingMatrix.length; k++){
                  nextConfig = getConfigCPUOptimized(config, spikingMatrix[k], ruleVector, synapseMatrix)
    
                  Q.push(nextConfig)
                }
            }
        }

        start = end
        end = Q.length
    
        iter++
    }
    
    // for(let j = start; j<end; j++){
    //     console.log("C4: " + Q[j])
    // }

    return Q
}