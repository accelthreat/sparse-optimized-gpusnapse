import { SNP } from "./types";
import { PAD } from './constants'
import { generateOptimizedSpikingVector } from "./generateOptimizedSpikingVector";
import { getConfigGPUOptimized } from "./getConfigGPUOptimized";
import { getConfigCPUOptimized } from "./getConfigCPUOptimized";

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