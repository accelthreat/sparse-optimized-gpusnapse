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

//Our code starts here ----------------------------
const PAD = -1

export const genExampleMatrixSimple = () => {
  let n = prompt("Please enter a number (must be powers of 2)");
  fetch("src/data/" + n + ".txt")
  .then((response) => {
      return response.text();
  })
  .then((text) => {
      console.log(text);
  });

  let configurationVector: SNP.Config = [2, 1, 1] //c0
  let ruleVector: SNP.RuleVector = [[1, 1], [2, 1], [1, 1], [1, 1], [2, 0]]

   let synapseMatrix: SNP.SynapseMatrix = [[PAD, 0, PAD], 
                                          [1, PAD, PAD], 
                                          [2, 2, PAD]]
  let spikingVector: SNP.SpikingVector = [0, 2, 3]

  return { configurationVector, ruleVector, synapseMatrix, spikingVector }
}

// ************added blocks of code as of march 21
function powerOfTwo(x: number) {
  return Math.log2(x) % 1 === 0;
}

const transpose = (matrix:number[][]) => {
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

const arrStr_to_arrNum = (arrStr:string[]) => {
  let arrNum:number[] = []
  arrStr.forEach(str => {
    arrNum.push(Number(str));
  });

  return arrNum;
}

export const generateSpikingVector = (configurationVector: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[]) => {
  let spikingVector: SNP.SpikingVector = Array(configurationVector.length).fill(-1)

  for(let neuron = 0; neuron<configurationVector.length; neuron++) {
    const spikes = configurationVector[neuron]
   // console.log("Spikes:" , configurationVector)
    const exprToMatch = "a".repeat(spikes)

    if(neuron === neuronRuleMapVector.length - 1) {
      for(let ruleIndex = neuronRuleMapVector[neuron]; ruleIndex<ruleExpVector.length; ruleIndex++) {
        //We matched the rule, assumed deterministic so no more possible matches
        if(exprToMatch.match(ruleExpVector[ruleIndex]) !== null) {
          spikingVector[neuron] = ruleIndex
          break
        }
      }
    } else {
      for(let ruleIndex = neuronRuleMapVector[neuron]; ruleIndex<neuronRuleMapVector[neuron + 1]; ruleIndex++) {
        //We matched the rule, assumed deterministic so no more possible matches
        if(exprToMatch.match(ruleExpVector[ruleIndex]) !== null) {
          spikingVector[neuron] = ruleIndex
          break
        }
      }
    }
  
  }

  return spikingVector
}

export const genExampleMatrix = async () => {
  // initialize the vectors needed
  let configurationVector: SNP.Config = []
  let ruleVector: SNP.RuleVector = []
  let synapseMatrix: SNP.SynapseMatrix = []
  let spikingVector: SNP.SpikingVector = []
  let neuronRuleMapVector: number[] = []
  let ruleExpVector: RegExp[] = []

  let n = prompt("Please enter how many input for bitonic sort (must be power of 2)") as string;
  if(!(powerOfTwo(parseInt(n)))){
    alert("Input is not a power of two.")
  }

  const response = await fetch("src/data/bitonic" + n + "_cuda.txt")
  const text = await response.text()
  let lines = text.split('\n');
    let numOfNeurons = parseInt(lines[0])
    let numOfRules = parseInt(lines[1])
    // line 3 config vector
    // turn arr of str to arr of num
    let strConfigurationVector = lines[3].split(' ')
    configurationVector = arrStr_to_arrNum(strConfigurationVector)

    // populate synapse matrix
    // lines 4 to 4+numOfNeurons are synapse connections
    for(let i=4; i<4+numOfNeurons; i++){
      let temp = lines[i].split(' ') as any
      temp = arrStr_to_arrNum(temp) as number[]
      temp.shift()      // starting from index 1 is the connection
      let tempArr = Array(numOfNeurons).fill(PAD)      // fill the array first with -1
      temp.map((index:number)=> tempArr[index] = index);
      synapseMatrix.push(tempArr)
    }
    // transpose synapseMatrix to fit CSR format
    synapseMatrix = transpose(synapseMatrix)

    let lastNeuron = -1;
    // populate rule vector
    let indexOfFirstRule = 4 + numOfNeurons
    for(let j=indexOfFirstRule; j<indexOfFirstRule+numOfRules; j++){
      let tempRule = lines[j].split(' ') as any

      if(tempRule[0] != lastNeuron) {
        lastNeuron = tempRule[0]
        neuronRuleMapVector.push(j-indexOfFirstRule)
      }

      const cusnp_to_js_regex = RegExp(/\d+/, "g")
      const jsExp = tempRule[1].replaceAll(cusnp_to_js_regex, '{$&}')
      ruleExpVector.push(RegExp("^" + jsExp + "$"))

      // remove first 2 elements
      tempRule.splice(0, 2)
      // remove last element if delay is not considered
      tempRule.pop()
      tempRule = arrStr_to_arrNum(tempRule) as number[]
      ruleVector.push(tempRule)        // push the rules to the rule vector
    }

    while(neuronRuleMapVector.length < configurationVector.length) {
      neuronRuleMapVector.push(ruleExpVector.length)
    }
    
    console.log(ruleExpVector);
    console.log(neuronRuleMapVector);
    
    spikingVector = generateSpikingVector(configurationVector, neuronRuleMapVector, ruleExpVector)
    // console.log("Start")
    // console.log(configurationVector)
    // console.log(synapseMatrix)
    // console.log(ruleVector)
    // console.log("End")

  return { configurationVector, ruleExpVector, neuronRuleMapVector, ruleVector, synapseMatrix, spikingVector }
}

// *************

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
    const j = spikingVector[this.thread.y]
    
    if (j === PAD) {
      return 0;
    }

    const [c, p] = ruleVector[j]
    if(this.thread.x === this.thread.y) {
      return -c
    } else if (synapseMatrix[this.thread.x][this.thread.y]!== PAD) {
      return p
    } else {
      return 0;
    }
  }).setOutput([config.length, config.length])

 // console.log(spikingVector)
 // console.log(getPerNeuronConfig(spikingVector, ruleVector, synapseMatrix))
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
 // console.log(result)
  return result
}

// export function getConfigGPUOptimizedV2(initialConfig: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[], ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix, isGPU: boolean = true, maxRuns: number = 100) {
//   const configMatrixLength = initialConfig.length

//   const getPerNeuronConfig = gpu.createKernel(function (spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
//     const PAD = -1
//     const j = spikingVector[this.thread.y]
    
//     if (j === PAD) {
//       return 0;
//     }

//     const [c, p] = ruleVector[j]
//     if(this.thread.x === this.thread.y) {
//       return -c
//     } else if (synapseMatrix[this.thread.x][this.thread.y]!== PAD) {
//       return p
//     } else {
//       return 0;
//     }
//   }).setOutput([initialConfig.length, initialConfig.length])

//   const columnarAdd2 = gpu.createKernel(function (configMatrix: number[][], initialConfig: number[]) {
//     let sum = initialConfig[this.thread.x]
//     for (let i = 0; i<this.constants.configMatrixLength; i++) {
//       sum += configMatrix[i][this.thread.x]
//     }
//     return sum;
//   }).setOutput([initialConfig.length]).setConstants({configMatrixLength: configMatrixLength})
  
//   const combinePerNeuronConfigs = gpu.combineKernels(getPerNeuronConfig as any, columnarAdd2 as any, function (config: SNP.Config, spikingVector: SNP.SpikingVector, ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix) {
//     return columnarAdd2(getPerNeuronConfig(spikingVector, ruleVector, synapseMatrix), config)
//   }).setPipeline(true)
  
//   const getFinalConfig = gpu.combineKernels(combinePerNeuronConfigs as any, function (initialConfig: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[], ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix, isGPU: boolean = true, maxRuns: number = 100) {
//     function isComputationNotDone(spikingVector: SNP.SpikingVector) {
//       for(let i = 0; i<spikingVector.length; i++) {
//         if(spikingVector[i] !== PAD) {
//           return true
//         }
//       }
    
//       return false
//     }
    
//     let config = initialConfig
//     let spikingVector: SNP.SpikingVector = generateSpikingVector(config, neuronRuleMapVector, ruleExpVector)
  
//     let iter = 0;
    
//     while(iter < this.constants.maxRuns && isComputationNotDone(spikingVector) ) {
//       config = combinePerNeuronConfigs(config, spikingVector, ruleVector, synapseMatrix)
//       spikingVector = generateSpikingVector(config, neuronRuleMapVector, ruleExpVector)
//     }
    
//   }).setOutput([initialConfig.length]).setConstants({maxRuns: maxRuns})
  
//   const result = getFinalConfig(initialConfig, neuronRuleMapVector, ruleExpVector,ruleVector, synapseMatrix) as number[]
//  // console.log(result)
//   return result
// }

function isComputationNotDone(spikingVector: SNP.SpikingVector) {
  for(let i = 0; i<spikingVector.length; i++) {
    if(spikingVector[i] !== PAD) {
      return true
    }
  }

  return false
}
export function getFinalConfig(initialConfig: SNP.Config, neuronRuleMapVector: number[], ruleExpVector: RegExp[], ruleVector: SNP.RuleVector, synapseMatrix: SNP.SynapseMatrix, isGPU: boolean = true, maxRuns: number = 100) {
  let config = initialConfig
  let spikingVector: SNP.SpikingVector = generateSpikingVector(config, neuronRuleMapVector, ruleExpVector)

  let iter = 0;
  
  while(iter < maxRuns && isComputationNotDone(spikingVector) ) {
    if(isGPU) {
      config = getConfigGPUOptimized(config, spikingVector, ruleVector, synapseMatrix)
    } else {
      config = getConfigCPUOptimized(config, spikingVector, ruleVector, synapseMatrix)
    }
    spikingVector = generateSpikingVector(config, neuronRuleMapVector, ruleExpVector)
  }
  
  return config
}