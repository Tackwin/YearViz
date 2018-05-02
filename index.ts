import * as express from "express";

const app = express();

app.use(express.static("."));

app.listen(1234);
console.log("Started...");
