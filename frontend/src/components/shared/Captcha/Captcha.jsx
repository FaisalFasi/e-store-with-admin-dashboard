import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

const Captcha = ({ onVerify }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY; // Replace with your site key

  const handleChange = (value) => {
    if (onVerify) {
      onVerify(value); // Pass the CAPTCHA value to the parent component
    }
  };

  return (
    <div className="w-full">
      <ReCAPTCHA sitekey={siteKey} onChange={handleChange} />
    </div>
  );
};

export default Captcha;
