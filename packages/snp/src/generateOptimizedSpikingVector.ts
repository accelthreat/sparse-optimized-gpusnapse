import { SNP } from "./types"

export const generateOptimizedSpikingVector = (configurationVector: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[]) => {
    let spikingVector: SNP.SpikingVector = Array(configurationVector.length).fill(-1)

    for (let neuron = 0; neuron < configurationVector.length; neuron++) {
        const spikes = configurationVector[neuron]
        const exprToMatch = "a".repeat(spikes)

        if (neuron === neuronRuleMapVector.length - 1) {
            for (let ruleIndex = neuronRuleMapVector[neuron]; ruleIndex < ruleExpVector.length; ruleIndex++) {
                if (exprToMatch.match(ruleExpVector[ruleIndex]) !== null) {
                    spikingVector[neuron] = ruleIndex
                    break
                }
            }
        } else {
            for (let ruleIndex = neuronRuleMapVector[neuron]; ruleIndex < neuronRuleMapVector[neuron + 1]; ruleIndex++) {
                if (exprToMatch.match(ruleExpVector[ruleIndex]) !== null) {
                    spikingVector[neuron] = ruleIndex
                    break
                }
            }
        }

    }

    return spikingVector
}