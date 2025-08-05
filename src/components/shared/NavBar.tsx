"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WalletConnect from "./wallet/WalletConnect";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";

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
        scrolled
          ? "bg-qacc-black border-b border-neutral-800"
          : "bg-transparent"
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

          <Sheet>
            <SheetTrigger asChild>
              <button className="text-neutral-400 hover:text-white p-2 lg:hidden">
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#141414] border-r border-neutral-800 flex flex-col h-full w-[300px]"
            >
              <div className="flex flex-col justify-between h-full pb-3">
                <div className="space-y-6">
                  {navItems.map((item, idx) => (
                    <SheetClose asChild key={`mobile-link-${idx}`}>
                      <Link
                        href={item.link}
                        target={item.blank ? "_blank" : "_self"}
                        className={`block px-2 py-3 text-sm font-medium ${
                          item.colored ? "text-peach-400" : "text-white"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                <WalletConnect />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
