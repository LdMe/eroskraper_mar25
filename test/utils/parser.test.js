import Parser from "../../src/utils/parser.js";
import fs from "fs";

let parser;
describe("test del parser de eroski",()=>{
    
    beforeAll(()=>{
        const html = fs.readFileSync("test/utils/eroski.html", "utf8");
        parser = new Parser(html);
    })
    it("debería devolver la sección de productos",()=>{
        const productListHtml = parser.getProductList();
        expect(productListHtml.innerHTML).toContain("Showing results for leche");
    })
    it("debería sacar la tarjeta de producto",()=>{
        const products = parser.getProducts();
        expect(products.length).toEqual(60);

    })
    it("debería conseguir la imagen del producto",()=>{
        const products = parser.getProducts();
        const product = products[0];
        const image = parser.getProductImage(product);
        expect(image).toEqual("https://supermercado.eroski.es/images/18672295_4_x.jpg");

    })
    it("debería devolver la descripción",()=>{
        const products = parser.getProducts();
        const product = products[0];
        const description = parser.getProductDescription(product);
        expect(description).toContain("Leche entera del País Vasco")
    })
    it("debería devolver el precio",()=>{
        const products = parser.getProducts();
        const product = products[0];
        const price = parser.getProductPrice(product);
        expect(price).toEqual(1.09);
    })
    it("debería devolver la info de un producto en formato json",()=>{
        const products = parser.getParsedProducts();
        expect(products.length).toEqual(60);
        const product = products[0];
        expect(product.image).toEqual("https://supermercado.eroski.es/images/18672295_4_x.jpg");
        expect(product.description).toContain("Leche entera del País Vasco");
        expect(product.price).toEqual(1.09);
    })
})

