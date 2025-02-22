import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU();

export function getConfigGPU (
  c: SNP.Config,
  s: SNP.SpikingVector,
  m: SNP.SpikingTransitionMatrix,
) {

  const multSpikingTransition = gpu.createKernel(function (s: SNP.SpikingVector, m: SNP.SpikingTransitionMatrix) {
    return m[this.thread.y][this.thread.x] * s[this.thread.y]
  }).setOutput([m[0].length, s.length])
  //assumes m is not empty matrix
  const columnarAdd = gpu
    .createKernel(function (c: SNP.Config, m: SNP.SpikingTransitionMatrix) {
      let sum = c[this.thread.x]
      for (let i = 0; i < this.constants.transitionMatrixLength; i++) {
        sum += m[i][this.thread.x]
      }
      return sum
    })
    .setOutput([c.length]).setConstants({ transitionMatrixLength: m.length })

  const compute = gpu.combineKernels(
    multSpikingTransition as any,
    columnarAdd as any,
    function (c: SNP.Config, s: SNP.SpikingVector, m: SNP.SpikingTransitionMatrix,) {
      //console.log(multSpikingTransition(s,m))
      let x = columnarAdd(
        c,
        multSpikingTransition(s, m),
      )
      return x
    }
  )

  const result = compute(c, s, m) as number[]

  return result
}
