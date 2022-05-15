import { PAD } from "./constants";
import { generateOptimizedSpikingVector } from "./generateOptimizedSpikingVector";
import { SNP } from "./types";

function powerOfTwo(x: number) {
    return Math.log2(x) % 1 === 0;
}

const transpose = (matrix: number[][]) => {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

const arrStr_to_arrNum = (arrStr: string[]) => {
    let arrNum: number[] = []
    arrStr.forEach(str => {
        arrNum.push(Number(str));
    });

    return arrNum;
}


export const generateBitonicSortingNetworkOptimized = async () => {
    // initialize the vectors needed
    let configurationVector: SNP.Config = []
    let ruleVector: SNP.RuleVector = []
    let synapseMatrix: SNP.SynapseMatrix = []
    let spikingVector: SNP.SpikingVector = []
    let neuronRuleMapVector: number[] = []
    let ruleExpVector: RegExp[] = []

    let n = prompt("Please enter how many input for bitonic sort (must be power of 2)") as string;
    if (!(powerOfTwo(parseInt(n)))) {
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
    for (let i = 4; i < 4 + numOfNeurons; i++) {
        let temp = lines[i].split(' ') as any
        temp = arrStr_to_arrNum(temp) as number[]
        temp.shift()      // starting from index 1 is the connection
        let tempArr = Array(numOfNeurons).fill(PAD)      // fill the array first with -1
        temp.map((index: number) => tempArr[index] = index);
        synapseMatrix.push(tempArr)
    }
    // transpose synapseMatrix to fit CSR format
    synapseMatrix = transpose(synapseMatrix)

    let lastNeuron = -1;
    // populate rule vector
    let indexOfFirstRule = 4 + numOfNeurons
    for (let j = indexOfFirstRule; j < indexOfFirstRule + numOfRules; j++) {
        let tempRule = lines[j].split(' ') as any

        if (tempRule[0] != lastNeuron) {
            lastNeuron = tempRule[0]
            neuronRuleMapVector.push(j - indexOfFirstRule)
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

    while (neuronRuleMapVector.length < configurationVector.length) {
        neuronRuleMapVector.push(ruleExpVector.length)
    }

    spikingVector = generateOptimizedSpikingVector(configurationVector, neuronRuleMapVector, ruleExpVector)
    return { configurationVector, ruleExpVector, neuronRuleMapVector, ruleVector, synapseMatrix, spikingVector }
}