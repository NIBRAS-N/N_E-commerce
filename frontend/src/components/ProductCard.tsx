import React from "react";
import { CartItem } from "../type/types";
import { FaPlus } from "react-icons/fa";


type ProductsProps = {
    productId: string;
    photo: string;
    name: string;
    price: number;
    stock: number;
    // handler: (cartItem:CartItem) => string | undefined;
    handler: () => void;
}
const ProductCard = ({productId,photo,name,price,stock,handler }:ProductsProps) => {
    const server = "lol";
    return(
        
        <div className="product-card">
            <img src={`${server}/${photo}`} alt={name}/>
            <img src={`https://images.pexels.com/photos/15219624/pexels-photo-15219624/free-photo-of-a-man-sitting-on-concrete-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`} alt={name}/>
            <p>{name}</p>
            <span>₹{price}</span>

            <div>
                <button onClick={()=>handler(
                    // { productId, price, name, photo, stock, quantity: 1 }
                )}>
                    <FaPlus/>
                </button>
            </div>
        </div>
        
    )
};

export default ProductCard;
