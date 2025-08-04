"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WalletConnect from "./wallet/WalletConnect";
import Image from "next/image";

export function NavBar() {
  const navItems = [
    {
      name: "Projects",
      link: "/",
      blank: false,
    },
    {
      name: "Leaderboard",
      link: "/leaderboard",
      blank: false,
    },
    {
      name: "Paper",
      link: "https://cdn.prod.website-files.com/667d6bc0b1e956f8d0b52c92/671a9d6f3bbff2f4d648e809_qacc.pdf",
      blank: true,
    },
    {
      name: "About",
      link: "/about",
      blank: false,
    },
    {
      name: "Apply for S3",
      link: "/about",
      blank: true,
      colored: true,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50  ${
        scrolled ? "bg-qacc-black border-b border-neutral-800" : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logos/logo-horisontal-light.svg"
                alt="Quadratic Accelerator"
                width={200}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          <div className="hidden lg:block">
            <div className=" flex items-baseline space-x-12">
              {navItems.map((item, idx) => (
                <Link
                  key={`nav-link-${idx}`}
                  href={item.link}
                  target={item.blank ? "_blank" : "_self"}
                  className={` hover:text-peach-400 text-sm font-medium transition-colors ${
                    item.colored ? "text-peach-400" : "text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <WalletConnect />
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-400 hover:text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-neutral-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 text-sm text-neutral-300 border-b border-neutral-700 mb-2">
              <div>Season 1 Token Claim In: 79 d</div>
              <div className="text-neutral-500">Vesting Timeline</div>
            </div>

            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                target={item.blank ? "_blank" : "_self"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-neutral-300 hover:text-white block px-3 py-2 text-base font-medium"
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-2 px-3">
              <button className="w-full bg-orange-400 hover:bg-orange-500 text-black font-medium px-6 py-2 rounded-full transition-colors">
                Sign In
              </button>
            </div>

            <div className="px-3 py-2">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
