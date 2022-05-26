from asyncore import write
import numbers
import random

# functions
# function random sum from https://stackoverflow.com/questions/31811267/how-to-generate-a-list-of-random-numbers-so-their-sum-would-be-equal-to-a-random
def random_sum_to(n, num_terms = None):
    num_terms = (num_terms or random.randint(2, n)) - 1
    a = random.sample(range(1, n), num_terms) + [0, n]
    list.sort(a)
    return [a[i+1] - a[i] for i in range(len(a) - 1)]



# Subset V
# n elements in V
# is there a subset in V where it equals S

# get input n
n = int(input())

# randomize input if there is a subset or not
isASubsetSum = random.randint(0,1)
print("isASubsetSum? " + str(isASubsetSum))
S = random.randint(50, 100)
print("S: " + str(S))

if(isASubsetSum):
    # generate random set V with confirmed subset sum equal to S
    V = random_sum_to(S, n-1)
    V.append(random.randint(1, 50))
else:
    # generate random set V
    V = []
    for i in range(n):
        V.append(random.randint(1, 50))

print("V: ")
print(V)

# compute number of neurons
sumOfElems = sum(V)
numOfNeurons = 3 + n + n + sumOfElems + 1 + 1
# print(numOfNeurons)

# compute number of rules
numOfRules = 3 + (3*n) + (2*n) + sum(V) + 1
# print(numOfRules)

# steps
steps = 4
# print(steps)

# initial config vector
initialConfigStr = "1 0 0"
for i in range(n):
    initialConfigStr += " 2"
remainingNeurons = numOfNeurons - (3 + n)
for i in range(remainingNeurons):
    initialConfigStr += " 0"

# print(initialConfigStr)

# generate conections between neurons
# c neurons
arrOfConnections = []
arrOfConnections.append("2 1 2")
strToAppend = str(n)
neuronNumber = 3 + n
for i in range(n):
    strToAppend += " " + str(neuronNumber + i)
arrOfConnections.append(strToAppend)
arrOfConnections.append(strToAppend)
strToAppend = ""
for i in range(3, n+3):
    strToAppend = "1"
    strToAppend += " " + str(i + n)
    arrOfConnections.append(strToAppend)

# d neurons
neuronNumber = 3+n # starting neuron number in d neurons
e_neuronNumber = neuronNumber + n  # start of e neuron
indx = 0   # elements in V

for i in range(neuronNumber, n+neuronNumber):
    numOfConnections = V[indx]
    strToAppend = str(numOfConnections)
    for j in range(e_neuronNumber, e_neuronNumber + numOfConnections):
        strToAppend += " " + str(j)
    arrOfConnections.append(strToAppend)
    indx+=1
    e_neuronNumber += numOfConnections

# e neurons
e_neuronNumber = neuronNumber + n
out1neuronNumber = e_neuronNumber + sumOfElems
for i in range(e_neuronNumber, out1neuronNumber):
    strToAppend = "1 " + str(out1neuronNumber)
    arrOfConnections.append(strToAppend)

# 2nd to the last neuron
arrOfConnections.append("1 " + str(out1neuronNumber + 1))

# output neuron
arrOfConnections.append("0")

# print(arrOfConnections)

# rules and neurons are from the paper "Uniform solutions to SAT and Subset Sum by spiking neural P systems" by Alberto Leporati, Giancarlo Mauri, Claudio Zandron, Gheorghe Pa˘un, Mario J. Pe´rez-Jime´nez
arrOfRules = []
arrOfRules.append("0 a 1 1 0") # c0
arrOfRules.append("1 a 1 1 0") # c'0
arrOfRules.append("2 a 1 1 0") # c''0
neuronNumber = 3    # start loop with neuron 3
strToAppend = ""
for i in range(n):
    strToAppend = str(i+3) + " a2 1 1 0"
    arrOfRules.append(strToAppend)
    strToAppend = str(i+3) + " a 1 1 0"
    arrOfRules.append(strToAppend)
    strToAppend = str(i+3) + " a2 2 1 0"
    arrOfRules.append(strToAppend)
# d neurons
neuronNumber = 3+n
for i in range(neuronNumber, neuronNumber+n):
    strToAppend = str(i) + " a3 3 0 0"
    arrOfRules.append(strToAppend)
    strToAppend = str(i) + " a4 4 1 0"
    arrOfRules.append(strToAppend)
# e neurons
e_neuronNumber = neuronNumber + n
for i in range(e_neuronNumber, out1neuronNumber):
    strToAppend = str(i) + " a 1 1 0"
    arrOfRules.append(strToAppend)
# 2nd to the last neuron
strToAppend = str(out1neuronNumber) + " a" + str(S) + " " + str(S) + " 1 0"

arrOfRules.append(strToAppend)

# print(arrOfRules)

# create file
f = open("subsetsum_" + str(n) + ".txt", "w")
f.write(str(numOfNeurons))
f.write("\n"+str(numOfRules))
f.write("\n"+str(steps))
f.write("\n"+initialConfigStr)
for i in range(len(arrOfConnections)):
    f.write("\n"+arrOfConnections[i])
for i in range(len(arrOfRules)):
    f.write("\n"+arrOfRules[i])
f.close()


# 15
# 23
# 4
# 1 0 0 2 2 2 0 0 0 0 0 0 0 0 0
# 2 1 2
# 3 6 7 8
# 3 6 7 8
# 1 6
# 1 7
# 1 8
# 1 9
# 2 10 11
# 1 12
# 1 13
# 1 13
# 1 13
# 1 13
# 1 14
# 0
# 0 a 1 1 0
# 1 a 1 1 0
# 2 a 1 1 0
# 3 a2 1 1 0
# 3 a 1 1 0
# 3 a2 2 1 0
# 4 a2 1 1 0
# 4 a 1 1 0
# 4 a2 2 1 0
# 5 a2 1 1 0
# 5 a 1 1 0
# 5 a2 2 1 0
# 6 a3 3 0 0
# 6 a4 4 1 0
# 7 a3 3 0 0
# 7 a4 4 1 0
# 8 a3 3 0 0
# 8 a4 4 1 0
# 9 a 1 1 0
# 10 a 1 1 0
# 11 a 1 1 0
# 12 a 1 1 0
# 13 a4 4 1 0



#     6                     < Number of neurons
#     6                     < Number of rules
#     10                    < Number of steps
#     49 99 0 0 0 0         < Initial Configuration
#     2 2 3                 < neuron 0 is connected to 2 neurons, neuron 2 and 3
#     2 2 3
#     2 4 5
#     1 5                   < neuron 3 is connected to 1 neuron, neuron 5
#     0                     < neuron 4 and 5 is not connected to anything
#     0
#     0 a* 1 1 0             < Rule owned by neuron 0 of the form a^*/1 -> 1;0
#     1 a* 1 1 0
#     2 a2 2 1 0
#     2 a1 1 0 0
#     3 a2 2 0 0
#     3 a1 1 1 0