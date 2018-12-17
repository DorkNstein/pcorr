"use strict";
const math = require("mathjs");
var plotly = require('plotly')("linearDash", "mWXFe8516qtTkiiPcmIK");

const pcorr = require("./../lib");

const files = [{
	name: "/insurance.csv",
	output: "charges"
}, {
	name: "/avocado.csv",
	output: "AveragePrice"
}];

const file = files[0];
const readData = require("./data")(__dirname + file.name);
const output_var = file.output;
const moment = require("moment");
const intercept_var = "intercept";

readData.then(resp => {
  const data = resp.train_data;
  const x_matrix = [];
  const variables = {};
  const headers = data[0];
  const inputs = [];
  const text_inputs = [];
  const date_inputs = [];
  const output = [];

  /** Extract inputs & text inputs */
  for (const key in headers) {
    if (key !== output_var) {
      variables[key] = [];
      if (isNaN(headers[key])) {
        const date = moment(headers[key]);
        console.log(key, ":date check:", date.isValid());
        if (!date.isValid()) text_inputs.push(key);
        else {
          date_inputs.push(key);
          delete variables[key];
          continue;
        }
      }
      inputs.push(key);
    };
  }

  /** Clean data for numerical values & separate input arrays */
  data.map(x => {
    for (const key in x) {
      if (key === output_var) {
        output.push(parseFloat(+x[key]));
      } else if (!!variables[key]) {
        let value = !isNaN(headers[key]) ? +x[key] : x[key];
        variables[key].push(value);
      };
    }
  });
  console.log("output.length ", output.length, inputs, { text_inputs });

  /** Set unique numerical values to replace text values */
  const unique = {};
  text_inputs.map(input => {
    unique[input] = [...new Set(variables[input])];
    variables[input] = variables[input].map(ele => {
      return unique[input].indexOf(ele) + 1;
    })
  });
  console.log("unique ", unique);

  /** Correlation Method */
  const corrInput = [output];
  inputs.map(input => {
    // console.log("input ", input, variables[input].length);
    corrInput.push(variables[input]);
  });
  const mat = pcorr(corrInput);

  /** Filter out just influencing inputs */
  let corrObj = {};
  const predictors = [];
  inputs.map((input, index) => {
    corrObj[input] = mat[0][index + 1];
    // if (Math.abs(corrObj[input]) > 0.05)
    predictors.push(input);
  })

  /** Form X matrix from input values */
  for (let i = 0; i < output.length; i++) {
    let x_matrix_row = [1];
    predictors.map(input => {
      x_matrix_row.push(variables[input][i]);
    })
    x_matrix.push(x_matrix_row);
  }
  console.log({ corrObj }, x_matrix.length, x_matrix[0].length);

  /** Linear Regression Method */
  const x_transpose = math.transpose(x_matrix);
  const inv = math.inv(math.multiply(x_transpose, x_matrix));
  const coeff = math.multiply(inv, x_transpose, output);
  const hat_matrix = math.multiply(x_matrix, inv, x_transpose);

  let coeffObj = {
    [intercept_var]: coeff[0]
  };
  predictors.map((input, index) => {
    coeffObj[input] = coeff[index + 1];
  });
  console.log("\ncoeff:", coeff.length);
  // console.log("\nhat_matrix:", hat_matrix);
  console.log("\ncoeffObj:", coeffObj);

  /** Clean test data & convert text strings to numerical values */
  const test_data = resp.train_data.map(d => {
    text_inputs.map(input => {
      d[input] = unique[input].indexOf(d[input]) + 1
    })
    return d;
  })

  let { err_matrix, y_hat } = sqErrorMethod(test_data, coeffObj, output_var, 0);
  const sq_err = math.multiply(math.transpose(err_matrix), err_matrix);
  const avg_err = Math.sqrt(sq_err / test_data.length);
  const sigma_hat_sq = sq_err / (output.length - coeff.length);
  console.log("Final sq_err ", sq_err, avg_err, sigma_hat_sq);

  const estimated_var_covar_matrix = scalar_matrix_multiply({
    matrix: inv,
    scalar: sigma_hat_sq
  });

	console.log("estimated_var_covar_matrix.length ", estimated_var_covar_matrix.length, estimated_var_covar_matrix[0].length);

	const coeff_corr = pcorr(estimated_var_covar_matrix);
	console.log("coeff_corr.length ", coeff_corr.length, coeff_corr[0].length);
  // plotData(y_hat, err_matrix);
});

const sqErrorMethod = (data, coeffObj, output_var, err) => {
  const y_hat = [];
  const err_matrix = [];
  // console.log("err ", err);
  for (let i = 0; i < data.length; i++) {
    let output_i = data[i][output_var];
    let calc_output = err;
    for (const key in coeffObj) {
      if (key === intercept_var) {
        calc_output += coeffObj[key];
      } else
        calc_output += data[i][key] * coeffObj[key];
    }
    y_hat.push(calc_output);
    err_matrix.push(output_i - calc_output);
    // if (i < 10) {
      // console.log("Outputs:", output_i, calc_output, output_i - calc_output);
    // }
  }
  return {
    y_hat,
    err_matrix
  };
}

const plotData = (y_hat, err_matrix) => {

  var layout = {
    title: 'Residuals vs fitted Values',
    xaxis: {
      title: 'Fitter Values'
    },
    yaxis: {
      title: 'Residuals'
    }
  };
  var trace1 = {
    x: y_hat,
    y: err_matrix,
    name: 'Residuals',
    mode: "markers",
    type: "scatter"
  };

  var trace3 = {
    x: y_hat,
    // y: err_matrix,
    name: 'Residuals',
    // mode: "markers",
    type: "histogram"
  };

  const zero_array = new Array(5);
  var trace2 = {
    x: y_hat,
    y: zero_array.fill(0),
    name: 'Linear Regression',
    mode: "lines",
    type: "scatter"
  };
  // var plotData = [trace1, trace2];
  // var graphOptions = { layout: layout, filename: "Residuals vs fitted", fileopt: "overwrite" }
  // plotly.plot(plotData, graphOptions, function(err, msg) {
  //   if (err) {
  //     console.log(err);
  //     process.exit(3);
  //   } else {
  //     console.log('Success! The plot (' + msg.filename + ') can be found at ' + msg.url);
  //     process.exit();
  //   }
  // });

  var plotData = [trace3];
  var graphOptions = { layout: layout, filename: "Residuals Histogram", fileopt: "overwrite" }
  plotly.plot(plotData, graphOptions, function(err, msg) {
    if (err) {
      console.log(err);
      process.exit(3);
    } else {
      console.log('Success! The plot (' + msg.filename + ') can be found at ' + msg.url);
      process.exit();
    }
  });
}

const scalar_matrix_multiply = ({ matrix, scalar }) => {
  return matrix.map(row => {
    if (Array.isArray(row)) {
      return row.map(x => x * scalar);
    } else {
      return row * scalar;
    }
  })
}
