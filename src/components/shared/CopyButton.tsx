"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  className?: string;
  iconColor?: string;
  iconClassName?: string;
}

export function CopyButton({
  text,
  className = "",
  iconColor = "fill-white",
  iconClassName = "w-5 h-5",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`ml-2 ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          className={` ${iconColor} ${iconClassName}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.0625 3.5H1.125C0.87636 3.5 0.637903 3.59877 0.462087 3.77459C0.286272 3.9504 0.1875 4.18886 0.1875 4.4375V15.375C0.1875 15.6236 0.286272 15.8621 0.462087 16.0379C0.637903 16.2137 0.87636 16.3125 1.125 16.3125H12.0625C12.3111 16.3125 12.5496 16.2137 12.7254 16.0379C12.9012 15.8621 13 15.6236 13 15.375V4.4375C13 4.18886 12.9012 3.9504 12.7254 3.77459C12.5496 3.59877 12.3111 3.5 12.0625 3.5ZM11.125 14.4375H2.0625V5.375H11.125V14.4375ZM15.8125 1.625V12.5625C15.8125 12.8111 15.7137 13.0496 15.5379 13.2254C15.3621 13.4012 15.1236 13.5 14.875 13.5C14.6264 13.5 14.3879 13.4012 14.2121 13.2254C14.0363 13.0496 13.9375 12.8111 13.9375 12.5625V2.5625H3.9375C3.68886 2.5625 3.4504 2.46373 3.27459 2.28791C3.09877 2.1121 3 1.87364 3 1.625C3 1.37636 3.09877 1.1379 3.27459 0.962087C3.4504 0.786272 3.68886 0.6875 3.9375 0.6875H14.875C15.1236 0.6875 15.3621 0.786272 15.5379 0.962087C15.7137 1.1379 15.8125 1.37636 15.8125 1.625Z" />
        </svg>
      )}
    </button>
  );
}
