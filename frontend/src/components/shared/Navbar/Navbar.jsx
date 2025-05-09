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
    if (user) {
      getCartItems();
    }
  }, [user]);

  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
      <div className="container mx-auto px-2 sm:px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-emerald-400 items-center space-x-2 flex"
          >
            E-Store
          </Link>

          {/* Desktop Navigation */}
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
          <nav className="hidden md:flex px-4 items-center gap-2">
            <CurrencySelector />
            <Button to={"/"} isBG={false} className="hidden lg:block">
              <HomeIcon size={24} />
            </Button>

            {user && (
              <Link
                to={"/cart"}
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
              </Link>
            )}
            <Button
              isBG={false}
              onClick={handleSubscribePopup}
              className="p-2 md:p-2"
            >
              <Mails size={24} />
            </Button>
            {isAdmin && (
              <Link
                className="bg-emerald-700 hover:bg-emerald-600 text-white px-2 py-1 rounded-md font-medium
                 transition duration-300 ease-in-out flex items-center"
                to={"/admin-dashboard"}
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
            )}

            {user ? (
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 lg:py-2 lg:px-4 
                rounded-md flex items-center transition duration-300 ease-in-out"
                onClick={logout}
              >
                <LogOut size={18} />
                <span className="hidden lg:inline ml-2">Log Out</span>
              </button>
            ) : (
              <>
                <Button
                  to="/signup"
                  isBG
                  icon={<UserPlus className="mr-1 lg:mr-2" size={18} />}
                >
                  <span className="text-sm lg:text-base">Sign Up</span>
                </Button>
                <Button
                  to="/login"
                  icon={<LogIn className="mr-1 lg:mr-2" size={18} />}
                >
                  <span className="text-sm lg:text-base">Login</span>
                </Button>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-800 animate-fadeIn">
            <div className="flex flex-col gap-4">
              <Button to={"/"} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Button>

              <CurrencySelector />

              {user && (
                <Link
                  to={"/cart"}
                  className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}

              <Button
                onClick={() => {
                  handleSubscribePopup();
                  setMobileMenuOpen(false);
                }}
                className="flex "
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
                <div className="flex flex-col gap-3">
                  <Link
                    to="/signup"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4
                        rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="mr-2" size={18} />
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4
                        rounded-md flex items-center justify-center transition duration-300 ease-in-out"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="mr-2" size={18} />
                    Login
                  </Link>
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
