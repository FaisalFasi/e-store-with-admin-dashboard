"use client";

import {
  ShoppingCart,
  UserPlus,
  LogIn,
  LogOut,
  Lock,
  Mails,
  Menu,
  X,

  HomeIcon,
  LockKeyhole,
  UserPlus2,

} from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../stores/useCartStore";
import { getUserData } from "../../../utils/getUserData";
import NewsLetterSubscriber from "../NewsLetterSubscriber/NewsLetterSubscriber";
import { useEffect, useState } from "react";
import Button from "../Button/Button";
import { CurrencySelector } from "@/components/currencyProvider/CurrencySelector";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = () => {
  const { user, logout } = getUserData();
  const isAdmin = user?.role === "admin";
  const { cart, getCartItems } = useCartStore();
  const [openSubscribePopup, setOpenSubscribePopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubscribePopup = () => {
    setOpenSubscribePopup(!openSubscribePopup);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    // Check if the user is logged in
    // if (user) {
    getCartItems();
    // }
  }, [user]);
  console.log(" Navbar---", cart);
  console.log(" Navbar---", cart.length);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-2 sm:px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-emerald-500 items-center space-x-2 flex hover:text-emerald-400 transition duration-300"
          >
            E-Store
          </Link>

          {/* Desktop Navigation Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-md mx-auto">
            <SearchBar />
          </div>

          {/* Mobile Menu Button */}
          <div className=" flex md:hidden justify-center items-center gap-2">
            <div className="relative">
              <SearchBar mobile={true} />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-emerald-400 transition duration-300"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Actions */}
          <nav className="hidden md:flex px-4 items-center justify-center gap-2">
            <CurrencySelector />


            {/* {user && ( */}
            <Button
              to={"/cart"}
              isBG={false}
              className="relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"
            >
              <ShoppingCart
                className="inline-block mr-1 group-hover:text-emerald-400"
                size={20}
              />
              <span className="hidden lg:inline">Cart</span>
              {cart.length > 0 && (
                <span
                  className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
                    text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out"
                >
                  {cart.length}
                </span>
              )}
            </Button>
            <Button
              isBG={false}
              onClick={handleSubscribePopup}
              className="p-2 md:p-2"
            >
              <Mails size={20} />
            </Button>
            {isAdmin && (
              <Button
                isBG={true}
                to={"/admin-dashboard"}
                icon={<LockKeyhole size={20} />}
              >
                <span className="hidden lg:inline">Dashboard</span>
              </Button>
            )}

            {user ? (
              <Button
                isBG={false}
                className="flex gap-2"
                onClick={logout}
                icon={<LogOut size={20} />}
              >
                <span className="hidden lg:inline ">Log Out</span>
              </Button>
            ) : (
              <>
                <Button
                  to="/signup"
                  isBG={true}
                  className="w-fit"
                  icon={<UserPlus className="w-fit" size={20} />}
                >
                  <span className="hidden lg:block text-sm lg:text-base">
                    Sign Up
                  </span>
                </Button>

                <Button to="/login" isBG={false} icon={<LogIn size={18} />}>
                  <span className="hidden lg:block text-sm lg:text-base">
                    Login
                  </span>
                </Button>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-800 animate-fadeIn">
            <div className="flex flex-col gap-4">
              <CurrencySelector />

              {user && (
                <Button
                  to={"/cart"}
                  className="flex gap-2"
                  isBG={false}
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<ShoppingCart size={20} />}
                >
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {cart.length}
                    </span>
                  )}
                </Button>
              )}

              <Button
                onClick={() => {
                  handleSubscribePopup();
                  setMobileMenuOpen(false);
                }}
                isBG={false}
                className="flex p-2"
                icon={<Mails size={20} className="mr-2" />}
              >
                Newsletter
              </Button>

              {isAdmin && (
                <Link
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-2 rounded-md font-medium
                   flex items-center justify-center transition duration-300 ease-in-out"
                  to={"/admin-dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Lock className="mr-2" size={18} />
                  Dashboard
                </Link>
              )}

              {user ? (
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
                  rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={18} className="mr-2" />
                  Log Out
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    isBG={true}
                    icon={<UserPlus className="mr-2" size={18} />}
                  >
                    Sign Up
                  </Button>
                  <Button
                    to="/login"
                    isBG={false}
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<LogIn className="mr-2" size={18} />}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {openSubscribePopup && (
        <NewsLetterSubscriber setSubscribePopup={handleSubscribePopup} />
      )}
    </header>
  );
};

export default Navbar;
