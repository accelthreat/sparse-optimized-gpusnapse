import { SNP } from './types'

export const generateSpikingMatrix = (configurationVector: SNP.Config, ruleExpVector: [number, RegExp][]) => {
    let no_of_rules = ruleExpVector.length
    let m = configurationVector.length   // number of neurons
    let spikingMatrix: SNP.SpikingMatrix = []
    let spikingMatrix_Sparse: SNP.SpikingMatrix = []
    let applicabilityVector: SNP.ApplicabilityVector = [] 
    let countVector: SNP.CountVector = []
    let changeFreqVector: SNP.ChangeFrequencyVector = []
    let orderVector: SNP.OrderVector = []
    let ruleNumbers: number[][] = []

    // ** shorter version of generating rule numbers applicable compared to the block of code below (commented out)
    let flag
    for(let j = 0; j<m; j++) {
        const spikes = configurationVector[j]
        const exprToMatch = "a".repeat(spikes)
        ruleNumbers[j] = []
        flag = 0
        for(let rule = 0; rule < ruleExpVector.length; rule++) {
        
            if(j == ruleExpVector[rule][0]){
                if (exprToMatch.match(ruleExpVector[rule][1]) !== null) {
                    ruleNumbers[j].push(rule)
                    flag = 1
                }
            }
    
        }

        if(flag == 0) ruleNumbers[j].push(-1)
    }
    // **
  
  
    // generate spiking matrix alternative
    // ** codeblock from https://www.geeksforgeeks.org/combinations-from-n-arrays-picking-one-element-from-each-array/
  
    // To keep track of next element in
    // each of the m arrays
    let indices = new Array(m);
      
    // Initialize with first element's index
    for(let i = 0; i < m; i++)
        indices[i] = 0;
      
    while (true){
      
      // Print current combination
      let temp = []
      for(let i = 0; i < m; i++){
        temp.push(ruleNumbers[i][indices[i]])
      }
      spikingMatrix_Sparse.push(temp)
        
      // Find the rightmost array that has more
      // elements left after the current element
      // in that array
      let next = m - 1;
      while (next >= 0 && (indices[next] + 1 >= ruleNumbers[next].length)) next--;
        
      // No such array is found so no more
      // combinations left
      if (next < 0) break;
        
      // If found move to next element in that
      // array
      indices[next]++;
        
      // For all arrays to the right of this
      // array current index again points to
      // first element
      for(let i = next + 1; i < m; i++) indices[i] = 0;
    }
    // **
  
    //for(let i = 0; i < qt; i++) console.log("s: " + spikingMatrix[i])
    let chosenRuleNumber
    // convert spiking matrix to matrix representation and to 0's and 1's
    for(let eachSpikingVectors = 0; eachSpikingVectors < spikingMatrix_Sparse.length; eachSpikingVectors++){
        let spikingVector = Array(ruleExpVector.length).fill(0)
        for(let eachNeuron = 0; eachNeuron < m; eachNeuron++){
            chosenRuleNumber = spikingMatrix_Sparse[eachSpikingVectors][eachNeuron]
            if(chosenRuleNumber != -1) spikingVector[chosenRuleNumber] = 1
        }
        spikingMatrix.push(spikingVector)
    }
  
    return spikingMatrix
  }

export const generateSpikingMatrixOptimized = (configurationVector: SNP.Config, ruleExpVector: [number, RegExp][]) => {
    let no_of_rules = ruleExpVector.length
    let m = configurationVector.length   // number of neurons
    let spikingVector: SNP.SpikingVector = Array(m).fill(-1)
    let spikingMatrix: SNP.SpikingMatrix = []
    let applicabilityVector: SNP.ApplicabilityVector = [] 
    let countVector: SNP.CountVector = []
    let changeFreqVector: SNP.ChangeFrequencyVector = []
    let orderVector: SNP.OrderVector = []
    let ruleNumbers: number[][] = []

    // ** shorter version of generating rule numbers applicable compared to the block of code below (commented out)
    let flag
    for(let j = 0; j<m; j++) {
        const spikes = configurationVector[j]
        const exprToMatch = "a".repeat(spikes)
        ruleNumbers[j] = []
        flag = 0
        for(let rule = 0; rule < ruleExpVector.length; rule++) {
        
            if(j == ruleExpVector[rule][0]){
                if (exprToMatch.match(ruleExpVector[rule][1]) !== null) {
                    ruleNumbers[j].push(rule)
                    flag = 1
                }
            }
    
        }

        if(flag == 0) ruleNumbers[j].push(-1)
    }
    // **

    // // block of code and algo is based on the paper Handling Non-determinism in Spiking Neural P Systems: Algorithms and Simulations by Carandang et al
  
    // // j = neuron
    // // generate applicability vector and count vector
    // // also get the rule numbers that are applicable per neuron
    // let start = 0, end, sum, flag
    // for(let j = 0; j<m; j++) {
    //   const spikes = configurationVector[j]
    //   //console.log("spikes" + spikes)
    //   const exprToMatch = "a".repeat(spikes)
    //   ruleNumbers[j] = []
    //   flag = 0
    //   for(let ruleIndex = neuronRuleMapVector[j]; ruleIndex<neuronRuleMapVector[j+1]; ruleIndex++) {
    //     //We match every rule in the neuron
    //     if(exprToMatch.match(ruleExpVector[ruleIndex]) !== null) {
    //       applicabilityVector.push(1)
    //       ruleNumbers[j].push(ruleIndex)
    //       flag = 1
    //     }else{
    //       applicabilityVector.push(0)
    //     }
    //   }

    //   if(flag == 0) ruleNumbers[j].push(-1)
    //   end = applicabilityVector.length
    //   sum = applicabilityVector.slice(start, end).reduce((a,b)=> a + b, 0);
    //   countVector[j] = sum
    //   start = end
    // }

    // //console.log("app" + applicabilityVector)
    // //console.log("count" + countVector)
    
    // // generate change frequency vector
    // for(let j = 0; j<m; j++){
    //   if(j == 0){
    //     changeFreqVector[j] = 1
    //   }else{
    //     changeFreqVector[j] = changeFreqVector[j-1]*countVector[j]
    //   }
    // }
  
    // //console.log("change" + changeFreqVector)
  
    // let qt = (countVector.filter((a)=>a!=0)).reduce((a, b)=> a*b, 1)   // number of possible outcomes the system will have
  
    // // generate order vector
    // for(let j = 0; j<m; j++){
    //   let order = 1
    //   for(let i=neuronRuleMapVector[j]; i<neuronRuleMapVector[j+1]; i++){
    //     if(applicabilityVector[i] == 1){
    //       orderVector.push(order)
    //       order++
    //     }else{
    //       orderVector.push(0)   // 0 means null; no order
    //     }
    //   }
    // }
    // //console.log("order vector: " + orderVector)
  
    // // generate spiking matrix from "Handling Nondeterminism paper but not working"
    // // for(let k = 0; k<qt;k++){
    // //   spikingMatrix[k] = []
    // //   for(let i=0; i<no_of_rules; i++){
    // //     // get the neuron j where rule i belongs
    // //     // one liner code ref: https://stackoverflow.com/questions/12070757/selecting-biggest-number-smaller-than-a-variable-in-array
    // //     let j = Math.max.apply(Math, neuronRuleMapVector.filter(function(x){return x <= i}));
    // //     if(orderVector[i] == 0) spikingMatrix[k][i] = 0
    // //     if(applicabilityVector[i] == 1 && (orderVector[i]-1) == Math.floor(((k-1)/changeFreqVector[j]) % countVector[j])){
    // //       spikingMatrix[k][i] = 1
    // //     }else{
    // //       spikingMatrix[k][i] = 0
    // //     }
    // //   }
    // // }

    // // **** 
  
  
    // generate spiking matrix alternative
    // ** codeblock from https://www.geeksforgeeks.org/combinations-from-n-arrays-picking-one-element-from-each-array/
  
    // To keep track of next element in
    // each of the m arrays
    let indices = new Array(m);
      
    // Initialize with first element's index
    for(let i = 0; i < m; i++)
        indices[i] = 0;
      
    while (true){
      
      // Print current combination
      let temp = []
      for(let i = 0; i < m; i++){
        temp.push(ruleNumbers[i][indices[i]])
      }
      spikingMatrix.push(temp)
        
      // Find the rightmost array that has more
      // elements left after the current element
      // in that array
      let next = m - 1;
      while (next >= 0 && (indices[next] + 1 >= ruleNumbers[next].length)) next--;
        
      // No such array is found so no more
      // combinations left
      if (next < 0) break;
        
      // If found move to next element in that
      // array
      indices[next]++;
        
      // For all arrays to the right of this
      // array current index again points to
      // first element
      for(let i = next + 1; i < m; i++) indices[i] = 0;
    }
    // **
  
    //for(let i = 0; i < qt; i++) console.log("s: " + spikingMatrix[i])
  
    return spikingMatrix
  }