import { generateBitonicSortingNetwork, generateBitonicSortingNetworkOptimized, generateSubsetSum, generateSubsetSumOptimized, generateSpikingVector, getConfigCPU, getConfigGPU, getConfigCPU_nd, getConfigGPU_nd, getFinalConfig, getFinalConfigOptimized } from '../../snp/src'
import { getFinalConfig_nd} from '../../snp/src/getFinalConfig'
import { getFinalConfigOptimized_nd} from '../../snp/src/getFinalConfigOptimized'
import React, { useEffect } from 'react'

const log = (name: string, fn: Function) => {
  const t0 = performance.now()
  // console.log(fn())
  fn()
  const t1 = performance.now()
  console.log(`Call to ${name} took ${t1 - t0} milliseconds.`)
}

function App () {
  useEffect(() => {
    // ** for deterministic (not Optimized)
    const logMatrix = async () => {
      let c = await generateBitonicSortingNetwork()

      console.log("config start")
      console.log("Configuration Vector: ", c.configurationVector)
      console.log("RuleExp Vector: ", c.ruleExpVector)
      console.log("Spiking Transition Matrix: ", c.spikingTransitionMatrix_2D)
      console.log("Spiking Vector: ", c.spikingVector)
      console.log("config end")
      
      log('cpuFinal', () => getFinalConfig(c.configurationVector, c.ruleExpVector, c.spikingTransitionMatrix, [],  false))
      log('gpuFinal', () => getFinalConfig(c.configurationVector, c.ruleExpVector, [], c.spikingTransitionMatrix_2D))
    }

    // ** for non-deterministic (not Optimized)
    const logMatrix_nd = async () => {
      let c = await generateSubsetSum()

      // console.log("config start")
      // console.log("Configuration Vector: ", c.configurationVector)
      // console.log("RuleExp Vector: ", c.ruleExpVector)
      // console.log("Spiking Transition Matrix: ", c.spikingTransitionMatrix)
      // console.log("Spiking Matrix: ", c.spikingMatrix)
      // console.log("config end")
      

      //log('cpu', () => getConfigCPU_nd(c.configurationVector, c.spikingMatrix[0], c.spikingTransitionMatrix))
      //log('gpu', () => getConfigGPU_nd(c.configurationVector, c.spikingMatrix, c.spikingTransitionMatrix))
      log('cpuFinal', () => getFinalConfig_nd(c.configurationVector, c.ruleExpVector, c.spikingTransitionMatrix, false))
      log('gpuFinal', () => getFinalConfig_nd(c.configurationVector, c.ruleExpVector, c.spikingTransitionMatrix, true))
    }

    // ** for deterministic (Optimized)
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

    // ** for non-deterministic (Optimized)
    const logMatrixOptimized_nd = async () => {
      let c = await generateSubsetSumOptimized()
      // console.log("config start")
      // console.log("Configuration Vector: ", c.configurationVector)
      // console.log("Rule Vector: ", c.ruleVector)
      // console.log("Neuron Rule Map Vector: ", c.neuronRuleMapVector)
      // console.log("Synapse Matrix: ", c.synapseMatrix)
      // console.log("Spiking Vector: ", c.spikingVector)
      // console.log("config end")
      
      log('cpuFinalOptimized', () => getFinalConfigOptimized_nd(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix, false))
      log('gpuFinalOptimized', () => getFinalConfigOptimized_nd(c.configurationVector, c.neuronRuleMapVector, c.ruleExpVector, c.ruleVector, c.synapseMatrix))
    }

    // call the functions here
    // logMatrix()
    logMatrix_nd()
    logMatrixOptimized_nd()
    
  }, [])

  return (
    <div></div>
  )
}

export default App
