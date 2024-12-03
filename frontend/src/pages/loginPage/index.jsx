import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../../stores/useUserStore";
import Captcha from "../../components/shared/Captcha/Captcha";
import toast from "react-hot-toast";
import ForgotPasswordForm from "../../components/auth/ForgetPassowrdForm/ForgotPasswordForm";
import { useState } from "react";

const LoginPage = () => {
  const [captcha, setCaptcha] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loading } = useUserStore();

  const onCaptchaChange = (value) => {
    setCaptcha(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captcha) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    console.log("email and password from form:", email, password);
    // other way to get form data one by one
    // const email = formData.get("email");
    // const password = formData.get("password");

    login(email, password, captcha);
  };

  return (
    <>
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
            Log In
          </h2>
        </motion.div>

        <motion.div
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
                      rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
                      focus:border-emerald-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
                      rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
                      focus:border-emerald-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent 
                  rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 
                  hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader
                      className="mr-2 h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                    Login
                  </>
                )}
              </button>
            </form>
            <div className="flex flex-col gap-6 pt-2">
              <button
                className="w-fit text-left text-sm font-medium text-gray-400"
                onClick={() => setShowForgotPassword(!showForgotPassword)}
              >
                Forgot password?
              </button>
              <Captcha onVerify={onCaptchaChange} />
            </div>
            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?
              <Link
                to="/signup"
                className="font-medium text-emerald-400 hover:text-emerald-300 pl-2"
              >
                Sign up now <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      {showForgotPassword && (
        <ForgotPasswordForm setForgotPassword={setShowForgotPassword} />
      )}
    </>
  );
};

export default LoginPage;
