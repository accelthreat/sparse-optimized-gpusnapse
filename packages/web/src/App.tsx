import { generateBitonicSortingNetwork, generateBitonicSortingNetworkOptimized, generateSpikingVector, getConfigCPU, getConfigGPU, getFinalConfig, getFinalConfigOptimized } from '@gpusnapse/snp'
import React, { useEffect } from 'react'
import { genMatrix } from '@gpusnapse/benchmarks/src'

//const setup = genMatrix(2)

const log = (name: string, fn: Function) => {
  const t0 = performance.now()
  console.log(fn())
  const t1 = performance.now()
  console.log(`Call to ${name} took ${t1 - t0} milliseconds.`)
}

function App () {
  useEffect(() => {
    // const spikingVectors = generateSpikingVectors(setup.c, setup.rules)
    // log('cpu', () => getConfigCPU(setup.c, spikingVectors, setup.m))
    // log('gpu', () => getConfigGPU(setup.c, spikingVectors, setup.m))

    const logMatrix = async () => {
      let c = await generateBitonicSortingNetwork()
      console.log("config start")
      console.log("Configuration Vector: ", c.configurationVector)
      console.log("RuleExp Vector: ", c.ruleExpVector)
      console.log("Spiking Transition Matrix: ", c.spikingTransitionMatrix)
      console.log("Spiking Vector: ", c.spikingVector)
      console.log("config end")
      

      log('cpu', () => getConfigCPU(c.configurationVector, c.spikingVector, c.spikingTransitionMatrix))
      log('gpu', () => getConfigGPU(c.configurationVector, c.spikingVector, c.spikingTransitionMatrix))
      log('cpuFinal', () => getFinalConfig(c.configurationVector, c.ruleExpVector, c.spikingTransitionMatrix, false))
      log('gpuFinal', () => getFinalConfig(c.configurationVector, c.ruleExpVector, c.spikingTransitionMatrix))
    }

    const logMatrixOptimized = async () => {
      let c = await generateBitonicSortingNetworkOptimized()
      console.log("config start")
      console.log("Configuration Vector: ", c.configurationVector)
      console.log("Rule Vector: ", c.ruleVector)
      console.log("Neuron Rule Map Vector: ", c.neuronRuleMapVector)
      console.log("Synapse Matrix: ", c.synapseMatrix)
      console.log("Spiking Vector: ", c.spikingVector)
      console.log("config end")
      
      log('cpu', () => getFinalConfigOptimized(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix, false))
      log('gpu', () => getFinalConfigOptimized(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix))
    }

    logMatrix()
  }, [])

  return (
    <div></div>
  )
}

export default App
