import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { FaShop, FaUser } from "react-icons/fa6";



const Header = () => {
    const user = {_id:"hj",role:"admin"};
    const [isOpen,setIsOpen] = useState<boolean>(false);

    const logoutHandler = () =>{

    }
  return (
    <nav className="header">
        <Link onClick={() => setIsOpen(false)} to={"/"}>Home</Link>
        <Link onClick={() => setIsOpen(false)} to={"/search"}> <FaSearch/> </Link>
        <Link onClick={() => setIsOpen(false)} to = {"/"}> <FaShop/> </Link>
        {
            user?._id ? (
                <>
                    <button onClick={()=>setIsOpen((prev)=>!prev)}>
                        <FaUser/>
                    </button>
                    <dialog open={isOpen}>
                        <div>
                            {user?.role === "admin" && (
                                <Link to={"/admin/dashboard"}>Admin</Link>
                            )}
                            <Link to={"/orders"}>Orders</Link>  
                            <button onClick={logoutHandler}>
                                <FaSignOutAlt/>
                            </button>
                        </div>
                    </dialog>
                </>
            ):(
                <Link to={"/login"}><FaSignInAlt/></Link>
            )
        }
    </nav>

  )
};

export default Header;
