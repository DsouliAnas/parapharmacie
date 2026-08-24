import type { ButtonHTMLAttributes } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({
  children,
  type = "button",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex
        min-h-12
        items-center
        justify-center
        rounded-full
        bg-[#7C8B73]
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        transition-colors
        duration-200
        hover:bg-[#66745F]
        focus:outline-none
        focus:ring-2
        focus:ring-[#7C8B73]
        focus:ring-offset-2
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:bg-gray-300
        disabled:text-gray-500
        sm:px-8
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}