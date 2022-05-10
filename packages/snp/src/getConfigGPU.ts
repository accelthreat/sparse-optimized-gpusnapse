import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU();

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
