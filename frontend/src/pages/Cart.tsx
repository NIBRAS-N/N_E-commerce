import React, { useState,useEffect } from "react";
import { VscError } from "react-icons/vsc";
import CartItem from "../components/Cart-Items";


const CartItems = [
  {
    productId : "fkfkd",
    photo :"https://images.pexels.com/photos/15219624/pexels-photo-15219624/free-photo-of-a-man-sitting-on-concrete-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    name: "printed jacket",
    price : 45334,
    quantity:43,
    stock:249
  }
];
const subtotal = 92830;
const tax = Math.round(subtotal*0.18);
const shippingCharges = 200;
const total = subtotal + tax  + shippingCharges;
const discount= 1;

const Cart = () => {

  const [coupon , setCoupon] = useState<string>("");
  const [isValidCoupon , setIsValidCoupon] = useState<boolean>(false);

  useEffect(() => {
    const timeOutId = setTimeout(()=>{
      if(Math.random()>=0.5) setIsValidCoupon(true);
      else setIsValidCoupon(false);
    },1000)
    return () => {
      clearTimeout(timeOutId);
      setIsValidCoupon(false);
    };
  }, [coupon]);
  
  return (
    <div className="cart">
        <main>

          {
            CartItems.map(i=> <CartItem key={i.productId} cItem={i}/>)
          }
        </main>
        <aside>
          <p>Subtotal: ₹{subtotal}</p>
          <p>Shipping Charges: ₹{shippingCharges}</p>
          <p>Tax: ₹{tax}</p>
          <p>
            Discount: <em className="red"> - ₹{discount}</em>
          </p>
          <p>
            <b>Total: ₹{total}</b>
          </p>
          <input 
            type="text"
            placeholder="Input the coupon Code here"
            value={coupon}
            onChange={(e)=>{setCoupon(e.target.value)}}
          />

          {
            coupon && (
              isValidCoupon ? (
                <span className="green">
                 ₹{discount} off using the <code>{coupon}</code>
                </span>
              ):(
                <span className="red">
                  Invalid Coupon <VscError />
                </span>
              )
            )
          }
        </aside>
        
    </div>  

  );
};

export default Cart;
