import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU()

export function getConfigGPU_nd (
  c: SNP.Config,
  s: SNP.SpikingMatrix,
  m: SNP.SpikingTransitionMatrix,
) {
  const width = c.length    // number of neurons
  const height = s[0].length    // number of rules
  const spikingVectorsLength = s.length

  const multiplyMatrix = gpu.createKernel(function(c: SNP.Config, s: SNP.SpikingMatrix, m: SNP.SpikingTransitionMatrix, h: number) {
    let sum = c[this.thread.x];
    for (let i = 0; i < h; i++) {
      sum += s[this.thread.y][i] * m[i][this.thread.x];
    }
    return sum;
  }).setOutput([width, s.length])

  const result = multiplyMatrix(c, s, m, height) as number[][]

  return result
}