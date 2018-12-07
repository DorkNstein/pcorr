// const pcorr = require("./../lib");
// Simulate some data...
// const N = 1000,
//   x = new Array(N),
//   y = new Array(N),
//   z = new Array(N),
//   a = new Array(N);

// for (let i = 0; i < N; i++) {
//   x[i] = Math.round(Math.random() * 100);
//   y[i] = Math.round(Math.random() * 100);
//   z[i] = 100 - x[i];
//   a[i] = 10 - y[i] / 3;
// }

// const mat = pcorr(x, y, z, a);


// Drug Data
// const N = 1000;
// const unit_price = [];
// const age = [];
// const zip = [];
// const staging_record_id = [];
// const lattitude = [];
// const longitude = [];
// const x_matrix = [];

// data
//   .slice(0, N)
//   .map(x => {
//     unit_price.push(+x.unit_price);
//     age.push(+x.age);
//     zip.push(+x.zip);
//     lattitude.push(+x.lattitude);
//     longitude.push(+x.longitude);
//     staging_record_id.push(+x.staging_record_id);
//     x_matrix.push([+x.age, +x.zip, +x.lattitude, +x.longitude, +x.staging_record_id]);
//   });

// /* Correlation Method */
// const mat = pcorr(unit_price, age, zip, lattitude, longitude, staging_record_id);
// console.log("Correlation: \n", mat);

// /* Linear Regression Method */
// const x_transpose = math.transpose(x_matrix);
// const inv = math.inv(math.multiply(x_transpose, x_matrix));
// const coeff = math.multiply(inv, x_transpose, unit_price);
// console.log("\ncoeff:", coeff);
