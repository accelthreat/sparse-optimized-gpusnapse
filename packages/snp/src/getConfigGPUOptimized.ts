import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU();

// export function getConfigGPUOptimized(config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
//     const configMatrixLength = config.length

//     const getPerNeuronConfig = gpu.createKernel(function (spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
//         const PAD = -1
//         const j = spikingVector[this.thread.y]

//         if (j === PAD) {
//             return 0;
//         }

//         const [c, p] = ruleVector[j]
//         if (this.thread.x === this.thread.y) {
//             return -c
//         } else if (synapseMatrix[this.thread.x][this.thread.y] !== PAD) {
//             return p
//         } else {
//             return 0;
//         }
//     }).setOutput([config.length, config.length])

//     const columnarAdd2 = gpu.createKernel(function (configMatrix: number[][], initialConfig: number[]) {
//         let sum = initialConfig[this.thread.x]
//         for (let i = 0; i < this.constants.configMatrixLength; i++) {
//             sum += configMatrix[i][this.thread.x]
//         }
//         return sum;
//     }).setOutput([config.length]).setConstants({ configMatrixLength: configMatrixLength })

//     const combinePerNeuronConfigs = gpu.combineKernels(getPerNeuronConfig as any, columnarAdd2 as any, function (config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
//         return columnarAdd2(getPerNeuronConfig(spikingVector, ruleVector, synapseMatrix), config)
//     })

//     const result = combinePerNeuronConfigs(config, spikingVector, ruleVector, synapseMatrix) as number[]
//     return result
// }

export function getConfigGPUOptimized(config: SNP.Config, spikingMatrix: SNP.SpikingMatrix, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
    const configMatrixLength = config.length
    const spikingMatrixLength =spikingMatrix.length

    const getPerNeuronConfig = gpu.createKernel(function (spikingMatrix: SNP.SpikingMatrix, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
        const PAD = -1
        const j = spikingMatrix[this.thread.z][this.thread.y]

        if (j === PAD) {
            return 0;
        }

        const [c, p] = ruleVector[j]
        if (this.thread.x === this.thread.y) {
            return -c
        } else if (synapseMatrix[this.thread.x][this.thread.y] !== PAD) {
            return p
        } else {
            return 0;
        }
    }).setOutput([config.length, config.length, spikingMatrix.length])

    const columnarAdd2 = gpu.createKernel(function (configMatrix: number[][][], initialConfig: number[]) {
        let sum = initialConfig[this.thread.x]
        
        for (let i = 0; i < this.constants.configMatrixLength; i++) {
            sum += configMatrix[this.thread.y][i][this.thread.x]
        }
        return sum

    }).setOutput([config.length, spikingMatrixLength]).setConstants({ configMatrixLength: configMatrixLength })

    const combinePerNeuronConfigs = gpu.combineKernels(getPerNeuronConfig as any, columnarAdd2 as any, function (config: SNP.Config, spikingMatrix: SNP.SpikingMatrix, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
        return columnarAdd2(getPerNeuronConfig(spikingMatrix, ruleVector, synapseMatrix), config)
    })
    const result = combinePerNeuronConfigs(config, spikingMatrix, ruleVector, synapseMatrix) as number[][]

    return result
}