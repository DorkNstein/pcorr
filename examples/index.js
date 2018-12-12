"use strict";
const math = require("mathjs");
const pcorr = require("./../lib");
const readData = require("./data")();
readData.then(resp => {
  const data = resp.train_data;
  const x_matrix = [];
  const variables = {};
  const headers = data[0];
  const output_var = "charges";
  const inputs = [];
  const output = [];
  for (const key in headers) {
    if (!isNaN(headers[key]) && key !== output_var) {
      variables[key] = [];
      inputs.push(key);
    };
  }

  data.map(x => {
      for (const key in x) {
        if (key === output_var) {
          output.push(parseFloat(+x[key]));
        } else if (!!variables[key]) {
          variables[key].push(+x[key]);
        };
      }
    });
  console.log("output.length ", output.length, inputs);

  /* Correlation Method */
  const corrInput = [output];
  inputs.map(input => {
    corrInput.push(variables[input]);
  });

  const mat = pcorr(corrInput);

  let corrObj = {};
  corrObj[output_var] = mat[0][0];

  const dep_inputs = [];
  inputs.map((input, index) => {
    corrObj[input] = mat[0][index + 1];
    if (Math.abs(corrObj[input]) > 0.1)
      dep_inputs.push(input);
  })

  data.map(h => {
    let x_matrix_row = [];
    for (const key in h) {
      if (dep_inputs.indexOf(key) >= 0) {
        x_matrix_row.push(+h[key]);
      }
    }
    x_matrix.push(x_matrix_row);
  })

  console.log({ output_var }, { corrObj });

  /* Linear Regression Method */
  const x_transpose = math.transpose(x_matrix);
  const inv = math.inv(math.multiply(x_transpose, x_matrix));
  const coeff = math.multiply(inv, x_transpose, output);

  let coeffObj = {};
  dep_inputs.map((input, index) => {
    coeffObj[input] = coeff[index];
  });

  // console.log("\ncoeff:", coeff);
  console.log("\ncoeffObj:", coeffObj);

  const test_data = resp.train_data;
  let sq_err = sqErrorMethod(test_data, coeffObj, output_var, 0);
  const avg_err = Math.sqrt(sq_err / test_data.length);
  console.log("Final sq_err ", sq_err, avg_err);

  // const test_data = resp.test_data;
  // let sq_err_2 = sqErrorMethod(test_data, coeffObj, output_var, -avg_err);
  // const avg_err_2 = Math.sqrt(sq_err_2) / test_data.length;

  // console.log("Final sq_err 2", sq_err_2, avg_err_2);
});

const sqErrorMethod = (data, coeffObj, output_var, err) => {
  let sq_err = 0;
  console.log("err ", err);
  for (let i = 0; i < data.length; i++) {
    let output_i = data[i][output_var];
    let calc_output = err;
    for (const key in coeffObj) {
      calc_output += data[i][key] * coeffObj[key];
    }
    sq_err += Math.pow(output_i - calc_output, 2);
    if (i < 10) {
      console.log("Outputs:", output_i, calc_output, output_i - calc_output);
    }
  }
  return sq_err;
}
