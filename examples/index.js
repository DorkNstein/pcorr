"use strict";
const math = require("mathjs");
const pcorr = require("./../lib");
const readData = require("./data")();
readData.then(data => {
  const N = 100000
  const x_matrix = [];
  const variables = {};
  const headers = data[0];
  const output_var = "price";
  const inputs = [];
  const output = [];
  for (const key in headers) {
    if (!isNaN(headers[key]) && key !== output_var) {
      variables[key] = [];
      inputs.push(key);
    };
  }
  console.log('inputs :', inputs);

  data
    .slice(0, N)
    .map(x => {
      let x_matrix_row = [];
      for (const key in x) {
        if (key === output_var) {
          output.push(+x[key]);
        } else if (!!variables[key]) {
          variables[key].push(+x[key]);
          x_matrix_row.push(+x[key]);
        };
      }
      x_matrix.push(x_matrix_row);
    });
  console.log("x_matrix.length ", x_matrix.length);
  console.log("output.length ", output.length);

  /* Correlation Method */
  const corrInput = [];
  inputs.map(input => {
    corrInput.push(variables[input]);
  });

  const mat = pcorr(output, ...corrInput);
  console.log("Correlation: \n", mat[0]);

  /* Linear Regression Method */
  const x_transpose = math.transpose(x_matrix);
  const inv = math.inv(math.multiply(x_transpose, x_matrix));
  const coeff = math.multiply(inv, x_transpose, output);
  console.log("\ncoeff:", coeff);

});
