import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.tsx";
import { CartItem } from "../type/types";


const Home = () => {

  const addToCartHandler = () =>{
    // if (cartItem.stock < 1) return 1;
    
  }
  return (
    <div className="home ">
      <section>
        
      </section>

      <h1>
        Latest Products
        <Link to={"/search"} className="findmore"> more</Link>
      </h1>

      <main>
      <ProductCard
              
              productId="1"
              name="lolad"
              price= {102}
              stock={111}
              handler={addToCartHandler}
              photo="lol"
      />
      </main>
    </div>
  );
};

export default Home;
