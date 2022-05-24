import { SNP } from './types'
import { GPU } from 'gpu.js'

const gpu = new GPU()

export function getConfigGPU_nd (
  c: SNP.Config,
  s: SNP.SpikingVector[],
  m: number[],
) {
  const width = c.length
  const height = s[0].length

  const multSpikingTransition = gpu.createKernel(function (s: SNP.SpikingVector[], m: number[], w: number) {
    return m[this.thread.x] * s[this.thread.y][Math.floor(this.thread.x / w)]
  }).setOutput([m.length, s.length])

  const columnarAdd = gpu.createKernel(function (c: SNP.Config, s: number[][], w: number, h: number) {
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
  
  // const startTime = performance.now();
  // console.time('gpu-multiply-matrix');
  const result = compute(c, s, m, width, height) as number[][]
  // console.timeEnd('gpu-multiply-matrix');
  // const endTime = performance.now();
  // const gpuTime = (endTime - startTime) + " ms";

  return result
}