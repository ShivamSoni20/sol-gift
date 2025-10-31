import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2";
  
  const variants = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
    outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-50 disabled:border-gray-300 disabled:text-gray-300",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
