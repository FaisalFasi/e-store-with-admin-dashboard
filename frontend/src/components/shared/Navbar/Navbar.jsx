import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../stores/useCartStore";
import { getUserData } from "../../../utils/getUserData";
import NewsLetterSubscriber from "../NewsLetterSubscriber/NewsLetterSubscriber";
import { useEffect, useState } from "react";
import { Mails } from "lucide-react";
import Button from "../Button/Button";
import { CurrencySelector } from "@/components/currencyProvider/CurrencySelector";

const Navbar = () => {
  const { user, logout, loginAsGuest } = getUserData();
  let isAdmin = user?.role === "admin";
  const { cart, getCartItems } = useCartStore();
  const [openSubscribePopup, setOpenSubscribePopup] = useState(false);

  const handleSubscribePopup = () => {
    setOpenSubscribePopup(!openSubscribePopup);
  };
  useEffect(() => {
    getCartItems();
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
          >
            E-Store
          </Link>

          {openSubscribePopup && (
            <NewsLetterSubscriber setSubscribePopup={handleSubscribePopup} />
          )}

          <nav className="flex flex-wrap items-center gap-2 md:gap-4">
            <CurrencySelector />
            <Button to={"/"} className="hidden sm:block">
              Home
            </Button>

            {user && (
              <Link
                to={"/cart"}
                className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 
							ease-in-out"
              >
                <ShoppingCart
                  className="inline-block mr-1 group-hover:text-emerald-400"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span
                    className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
									text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out"
                  >
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            <Button onClick={handleSubscribePopup}>
              <Mails />
            </Button>
            {isAdmin && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
								 transition duration-300 ease-in-out flex items-center"
                to={"/admin-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {user ? (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out"
                onClick={logout}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 md:py-2 px-2 md:px-4 text-sm md:text-xl
                      rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="bg-gray-700 hover:bg-gray-600 text-white py-1 md:py-2  px-2 md:px-4 text-sm md:text-xl 
                      rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Login
                </Link>
                {/* <button
                  onClick={() => loginAsGuest()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-1 md:py-2 px-2 md:px-4 text-sm md:text-xl 
                      rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <Key className="mr-2" size={18} />
                  Guest
                </button> */}
              </>

              // <>
              //   <Link
              //     to={"/signup"}
              //     className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 md:py-2 px-2 md:px-4 text-sm md:text-xl
              // 		rounded-md flex items-center transition duration-300 ease-in-out"
              //   >
              //     <UserPlus className="mr-2" size={18} />
              //     Sign Up
              //   </Link>
              //   <Link
              //     to={"/login"}
              //     className="bg-gray-700 hover:bg-gray-600 text-white py-1 md:py-2  px-2 md:px-4 text-sm md:text-xl
              // 		rounded-md flex items-center transition duration-300 ease-in-out"
              //   >
              //     <LogIn className="mr-2" size={18} />
              //     Login
              //   </Link>
              // </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
