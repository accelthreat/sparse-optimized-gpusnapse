import React, { useEffect } from 'react'
//import { genMatrix } from '@sparse-optimized-gpusnapse/benchmarks'
import {
  getConfigCPU,
  getConfigGPU,
  generateSpikingVectors,
  getConfigGPUOptimized, genExampleMatrix, getConfigCPUOptimized
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
    let c = genExampleMatrix()
    //let c1 = getConfigGPUOptimized(c.configurationVector, c.spikingVector, c.ruleVector, c.synapseMatrix)
    //console.log(c1)
  }, [])

  return (
    <div></div>
  )
}

export default App
