import { SNP } from "../../snp/src/types";

export const genMatrix = (n: number) => {
  let c = new Array(n);
  for (let z = 0; z < n; ++z) c[z] = 0

  let m = []
  for (let y = 0; y < n; ++y) {
    for (let i = 0; i < 2; ++i) {
      for (let neuron = 0; neuron < n; ++neuron) {
        if (neuron === y) {
          m.push(-1 * (i + 1))
        } else {
          m.push(i + 1)
        }
      }
    }
  }

  let rules = []
  for (let z = 0; z < n; ++z) {
    rules.push([
      new RegExp("^(aa)*$"),
      new RegExp("^(aa)*$")
    ])
  }

  console.log("GenMatrix:")
  console.log(c)
  console.log(m)
  return { c, m, rules, }
}