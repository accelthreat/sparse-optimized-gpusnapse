import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU({ mode: 'cpu' });

export function getConfigGPU (
  c: SNP.Config,
  s: SNP.SpikingVector[],
  m: SNP.SpikingTransitionMatrix,
) {
  const width = c.length
  const height = s[0].length

  const multSpikingTransition = gpu.createKernel(function (s: SNP.SpikingVector[], m: SNP.SpikingTransitionMatrix, w: number) {
    return m[this.thread.x] * s[this.thread.y][Math.floor(this.thread.x / w)]
  }).setOutput([m.length, s.length])

  const columnarAdd = gpu
    .createKernel(function (c: SNP.Config, s: SNP.SpikingTransitionMatrix[], w: number, h: number) {
      let sum = c[this.thread.x]
      for (let i = 0; i < h; i++) {
        sum += s[this.thread.y][i * w + this.thread.x]
      }
      return sum
    })
    .setOutput([width, s.length])

  const compute = gpu.combineKernels(
    multSpikingTransition as any,
    columnarAdd as any,
    function (c: SNP.Config, s: SNP.SpikingVector, m: SNP.SpikingTransitionMatrix, w: number, h: number) {
      return columnarAdd(
        c,
        multSpikingTransition(s, m, w),
        w,
        h
      )
    }
  )

  const result = compute(c, s, m, width, height) as number[][]

  return result
}

//Our code starts here ----------------------------
const PAD = -1

export const genExampleMatrix = () => {
  let configurationVector: SNP.Config = [2, 1, 1] //c0
  let ruleVector: SNP.RuleVector = [[1, 1], [2, 1], [1, 1], [1, 1], [2, 0]]

   let synapseMatrix: SNP.SynapseMatrix = [[PAD, 0, PAD], 
                                          [1, PAD, PAD], 
                                          [2, 2, PAD]]
  let spikingVector: SNP.SpikingVector = [0, 2, 3]

  return { configurationVector, ruleVector, synapseMatrix, spikingVector }
}

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

export function getConfigGPUOptimized(config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
  const configMatrixLength = config.length

  const getPerNeuronConfig = gpu.createKernel(function (spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
    const PAD = -1
    const j = spikingVector[this.thread.x]
    const [c, p] = ruleVector[j]
    if(this.thread.x === this.thread.y) {
      return -c
    } else if (synapseMatrix[this.thread.x][this.thread.y]!== PAD) {
      return p
    } else {
      return 0;
    }
  }).setOutput([config.length, config.length])

  const columnarAdd2 = gpu.createKernel(function (configMatrix: number[][], initialConfig: number[]) {
    let sum = initialConfig[this.thread.x]
    for (let i = 0; i<this.constants.configMatrixLength; i++) {
      sum += configMatrix[i][this.thread.x]
    }
    return sum;
  }).setOutput([config.length]).setConstants({configMatrixLength: configMatrixLength})
  
  const combinePerNeuronConfigs = gpu.combineKernels(getPerNeuronConfig as any, columnarAdd2 as any, function (config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
    return columnarAdd2(getPerNeuronConfig(spikingVector, ruleVector, synapseMatrix), config)
  })

  const result = combinePerNeuronConfigs(config, spikingVector, ruleVector, synapseMatrix) as number[]
  return result
}

