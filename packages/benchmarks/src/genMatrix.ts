import { SNP } from "../../snp/src/types";

export const genMatrix = (n: number) => {
  let c = new Array(n);
  for (let z = 0; z < n; ++z) c[z] = 0

  let m = []
  for (let y = 0; y < n; ++y) {
    for (let i = 0; i < 2; ++i) {
      for (let neuron = 0; neuron < n; ++neuron) {
        if (neuron === y) {
          m.push(-1 * (i + 1))
        } else {
          m.push(i + 1)
        }
      }
    }
  }

  let rules = []
  for (let z = 0; z < n; ++z) {
    rules.push([
      new RegExp("^(aa)*$"),
      new RegExp("^(aa)*$")
    ])
  }

  return { c, m, rules, }
}

const PAD = -1

export const genExampleMatrix = () => {
  let configurationVector: SNP.Config = [2, 1, 1] //c0
  let ruleVector: SNP.RuleVector = [[1, 1], [2, 1], [1, 1], [1, 1], [2, 0]]


  // let spikingTransitionMatrix = [[-2, 1, 1], [-2, 1, 1], [1, -1, 1], [0, 0, -1], [0, 0, -2]]
  let synapseMatrix: SNP.SynapseMatrix = [[PAD, 0, PAD], [1, PAD, PAD], [2, 2, PAD]]
  let spikingVector: SNP.SpikingVector = [0, 2, 3]

  return { configurationVector, ruleVector, synapseMatrix, spikingVector }
}

/*
RuPi  = RuleVector
SyPi = Synapse Matrix
Sk = SpikingVector
PPi = Preconditions vector = [(E,c)]
NPi = Neuron rule map vector
Mk = Transition tuple Mk = (MPi, PPi, NPi)
*/

export function getConfigGPUOptimized(config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
  let newConfig = [...config]
  for (let i = 0; i < spikingVector.length; i++) {
    let j = spikingVector[i]
    if (j !== -1) {
      let [c, p] = ruleVector[j]
      // console.log("c: %d, p: %d", c, p)
      newConfig[i] = newConfig[i] - c
      //console.log("New config of neuron %d after consume: %d", i, newConfig[i])
      let w = 0
      // console.log("Neuron %d", j)
      while (p > 0 && w < synapseMatrix.length) {
        if (synapseMatrix[w][i] !== PAD) {
          let h = synapseMatrix[w][i]
          //console.log("%d-%d", i, h)
          newConfig[h] = newConfig[h] + p
        }
        w += 1
      }
    }
  }
  return newConfig
}


let c = genExampleMatrix()
let c1 = getConfigGPUOptimized(c.configurationVector, c.spikingVector, c.ruleVector, c.synapseMatrix)