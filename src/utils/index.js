import fs from "fs";
import Parser from "./parser.js";

const html = fs.readFileSync("test/utils/eroski.html", "utf8");
const parser = new Parser(html);

const products = parser.getParsedProducts();
console.log(products);