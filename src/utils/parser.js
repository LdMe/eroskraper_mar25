import {JSDOM} from "jsdom";

class Parser{
    constructor(html){
        this.html = html;
        this.dom = new JSDOM(html);
    }
    getProductList() {
        return this.dom.window.document.querySelector(".search-result-content");
    }
    getProducts(){
        const productList = this.getProductList();
        const products = productList.querySelectorAll(".item-type-1:not(.criteoItem) .product-item.big-item");
        return products;
    }
    getProductImage(productNode){
        const imageNode = productNode.querySelector("img");
        return imageNode.dataset.bigimage;
    }
    getProductDescription(productNode){
        const descriptionNode = productNode.querySelector(".product-title");
        return descriptionNode.textContent;
    }
    getProductPrice(productNode){
        const priceNode = productNode.querySelector("span.price-offer-now");
        return parseFloat(priceNode.textContent.replace(",","."));
    }

    getParsedProducts(){
        const products= this.getProducts();
        const result = Array.from(products).map(product =>{
            return {
                image: this.getProductImage(product),
                description: this.getProductDescription(product),
                price: this.getProductPrice(product)
            }
        })
        return result;
    }
}

export default Parser;