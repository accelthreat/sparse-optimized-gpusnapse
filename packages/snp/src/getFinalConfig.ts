import { SNP } from "./types";
import { generateSpikingVector } from "./generateSpikingVector";
//import { getConfigGPU } from "./getConfigGPU";
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

    while (iter < maxRuns && isComputationNotDone(spikingVector)) {
        if (isGPU) {
            //config = getConfigGPU(config, spikingVector, ruleVector, synapseMatrix)
        } else {
            config = getConfigCPU(config, spikingVector, spikingTransitionMatrix)
        }
        spikingVector = generateSpikingVector(config, ruleExpVector)
        iter += 1
    }
    return config
}