export namespace SNP {
  export type Config = number[]
  export type SpikingVector = number[]
  export type SpikingTransitionMatrix = number[][]
  export type Neuron = {
    spike: number
    rules: [
      [RegExp, number]
    ]
  }
  export type RuleVector = [number, number][]
  export type SynapseMatrix = number[][]

  // added for nondeterministic
  export type SpikingMatrix = number[][]
  export type ApplicabilityVector = number[]  // length of neurons, elements are number of rules per neuron
  export type CountVector = number[]   // length of neurons
  export type ChangeFrequencyVector = number[]      // length of neurons
  export type OrderVector = number[]      // length = number of rules

}

export enum COMPUTATION {
  CPU = 'CPU',
  GPU = 'GPU'
}