import React, { useEffect } from 'react'
//import { genMatrix } from '@sparse-optimized-gpusnapse/benchmarks'
import {
  getConfigCPU,
  getConfigGPU,
  generateSpikingVectors,
  getConfigGPUOptimized, genExampleMatrix, genExampleMatrixSimple, getConfigCPUOptimized, getFinalConfig
} from "../../snp/src/index"

//const setup = genMatrix(14)

const log = (name: string, fn: Function) => {
  const t0 = performance.now()
  console.log(fn())
  const t1 = performance.now()
  console.log(`Call to ${name} took ${t1 - t0} milliseconds.`)
}

function App () {
  useEffect(() => {
    //const spikingVectors = generateSpikingVectors(setup.c, setup.rules)
    // log('cpu', () => getConfigCPU(setup.c, spikingVectors, setup.m))
    // log('gpu', () => getConfigGPU(setup.c, spikingVectors, setup.m))

    // let cs = genExampleMatrixSimple()
    // let cs1 = getConfigGPUOptimized(cs.configurationVector, cs.spikingVector, cs.ruleVector, cs.synapseMatrix)
    // console.log(cs1)

    const logMatrix = async () => {
      let c = await genExampleMatrix()
      console.log("config start")
      console.log("Configuration Vector: ", c.configurationVector)
      console.log("Rule Vector: ", c.ruleVector)
      console.log("Neuron Rule Map Vector: ", c.neuronRuleMapVector)
      console.log("Synapse Matrix: ", c.synapseMatrix)
      console.log("Spiking Vector: ", c.spikingVector)
      console.log("config end")
      
      log('cpu', () => getFinalConfig(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix, false))
      log('gpu', () => getFinalConfig(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix))
    }

    logMatrix()
  }, [])

  return (
    <div></div>
  )
}

export default App
