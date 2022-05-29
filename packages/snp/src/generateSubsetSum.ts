import { PAD } from "./constants";
import { generateOptimizedSpikingVector } from "./generateOptimizedSpikingVector";
import { generateSpikingVector } from "./generateSpikingVector";
import { generateSpikingMatrix } from "./generateSpikingMatrix";
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

export const generateSubsetSum = async () => {
    // initialize the vectors needed
    let configurationVector: SNP.Config = []
    let spikingVector: SNP.SpikingVector = []
    let synapseMatrix: SNP.SynapseMatrix = []
    const spikingTransitionMatrix_2D: number[][] = []
    const ruleExpVector: [number, RegExp][] = []
    let spikingMatrix: SNP.SpikingMatrix = []

    let n = prompt("Please enter how many input for subset sum (at least 3)") as string;

    const response = await fetch("src/data/subsetsum_" + n + ".txt")
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

    // populate rule vector
    for (let i = 0; i < numOfRules; i++) {
        spikingTransitionMatrix_2D.push(Array(numOfNeurons))
    }

    //ruleExpVector = Array(numOfRules)

    let indexOfFirstRule = 4 + numOfNeurons
    for (let i = indexOfFirstRule; i < indexOfFirstRule + numOfRules; i++) {

        let tempRule = lines[i].split(' ') as any //[ruleNeuronIndex, regex, c, p, d]
        let ruleNeuronIndex: number = parseInt(tempRule[0])
        for (let j = 0; j < numOfNeurons; j++) {
            if (ruleNeuronIndex === j) {
                spikingTransitionMatrix_2D[i - indexOfFirstRule][j] = -parseInt(tempRule[2])
            } else if (synapseMatrix[ruleNeuronIndex][j] !== -1) {
                spikingTransitionMatrix_2D[i - indexOfFirstRule][j] = parseInt(tempRule[3])
            } else {
                spikingTransitionMatrix_2D[i - indexOfFirstRule][j] = 0
            }
        }
    }

    // console.log("STM1")
    // console.log(spikingTransitionMatrix)
    for (let i = indexOfFirstRule; i < indexOfFirstRule + numOfRules; i++) {
        let tempRule = lines[i].split(' ') as any //[ruleNeuronIndex, regex, c, p, d]
        let ruleNeuronIndex: number = parseInt(tempRule[0])
        const cusnp_to_js_regex = RegExp(/\d+/, "g")
        const jsExp = tempRule[1].replaceAll(cusnp_to_js_regex, '{$&}')
        //ruleExpVector[i - indexOfFirstRule] = [ruleNeuronIndex, RegExp("^" + jsExp + "$")]
       ruleExpVector.push([ruleNeuronIndex, RegExp("^" + jsExp + "$")])
    }
    // console.log("STM2")
    // console.log(spikingTransitionMatrix)

    // convert spikingTransitionMatrix to number[] format instead of number[][]
    let spikingTransitionMatrix:number[] = []

    for(let i = 0; i < spikingTransitionMatrix_2D.length; i++)
    {
        spikingTransitionMatrix = spikingTransitionMatrix.concat(spikingTransitionMatrix_2D[i]);
    }

    // **added May 22
    spikingMatrix = generateSpikingMatrix(configurationVector, ruleExpVector)
    // **

    return { configurationVector, ruleExpVector, spikingTransitionMatrix, spikingTransitionMatrix_2D, spikingMatrix }
}