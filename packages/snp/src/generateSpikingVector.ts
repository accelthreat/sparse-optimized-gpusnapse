import { SNP } from './types'

export function generateSpikingVector(c: SNP.Config, ruleExpVector: [number, RegExp][]) {
  let spikingVector: number[] = Array(ruleExpVector.length).fill(0)

  for(let rule = 0; rule < ruleExpVector.length; rule++) {
    const spikes = c[ruleExpVector[rule][0]]
    const exprToMatch = "a".repeat(spikes)

    if (exprToMatch.match(ruleExpVector[rule][1]) !== null) {
      spikingVector[rule] = 1
    }
  }

  return spikingVector
}
