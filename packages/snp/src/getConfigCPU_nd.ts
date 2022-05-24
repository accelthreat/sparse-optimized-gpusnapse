import { SNP } from './types'

export function getConfigCPU_nd (
    c: SNP.Config,
    s: SNP.SpikingVector,
    m: number[],
  ) {
    const width = c.length
    const transition = new Array(m.length)
    const result = new Float32Array([...c])
  
    // multiply
    for (let s_i = 0; s_i < s.length; s_i++) {
      for (let m_i = 0; m_i < width; m_i++) {
        transition[s_i * width + m_i] = s[s_i] * m[s_i * width + m_i]
      }
    }
  
    // columnar add
    for (let t_i = 0; t_i < transition.length; t_i++) {
      const column = t_i % width
      result[column] += transition[t_i]
    }
  
    return result
}