import b from 'benny'
import { genMatrix } from './genMatrix'
import {
  getConfigCPU,
  getConfigGPU,
  generateSpikingVector
} from "@gpusnapse/snp"

const setup = genMatrix(12)
b.suite(
  'snp',
  // b.add('getConfigCPU', function() {
  //   const spikingVectors = generateSpikingVectors(setup.c, setup.rules)
  //   getConfigCPU(setup.c, spikingVectors, setup.m)
  // }),
  // b.add('getConfigGPU', function() {
  //   const spikingVectors = generateSpikingVectors(setup.c, setup.rules)
  //   getConfigGPU(setup.c, spikingVectors, setup.m)
  // }),
  b.cycle(),
  b.complete()
)