const express = require('express');
const app = express();

const apiFunction = require('./api.js');
const api = apiFunction();

app.use(express.json());
app.get("/customers", api.getAllCustomers);
app.get("/customers/:customerId", api.getCustomerById);
app.get("/suppliers", api.getAllSuppliers);
app.get("/products/", api.getAllproducts);

const port = 4000;
app.listen(port, () => {
    console.log(`app listening on port: ${port}`);
});