import { SNP } from './types'

export function getConfigCPU(config: SNP.Config, spikingVector: SNP.SpikingVector, spikingTransitionMatrix: SNP.SpikingTransitionMatrix) {
  let newConfig = [...config]
  let transitionNetGainVector = Array(config.length).fill(0)

  const temp = new Array(spikingVector.length).fill(0).map(() => new Array(spikingTransitionMatrix.length).fill(0));

  for(let s = 0; s<spikingVector.length; s++) {
    for(let m = 0; m<spikingTransitionMatrix.length; m++) {
      temp[s][m] += spikingTransitionMatrix[s][m] * spikingVector[s]
    }
  }

  // console.log("CPUInterMatrix")
  // console.log(temp)
  for(let x = 0; x<spikingTransitionMatrix.length; x++) {
    for(let y = 0; y<spikingTransitionMatrix.length; y++) {
      transitionNetGainVector[x] += temp[y][x]
    }
  }

  for(let x = 0; x<config.length; x++) {
    newConfig[x] += transitionNetGainVector[x]
  }
  
  return newConfig
}
