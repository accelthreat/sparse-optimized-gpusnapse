import { PAD } from './constants'
import { SNP } from './types'

export function getConfigCPUOptimized(config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
    let newConfig = [...config]
    for (let i = 0; i < spikingVector.length; i++) {
        let j = spikingVector[i]
        if (j !== -1) {
            let [c, p] = ruleVector[j]
            newConfig[i] = newConfig[i] - c
            let w = 0
            while (p > 0 && w < synapseMatrix.length) {
                if (synapseMatrix[w][i] !== PAD) {
                    let h = synapseMatrix[w][i]
                    newConfig[h] = newConfig[h] + p
                }
                w += 1
            }
        }
    }
    return newConfig
}
