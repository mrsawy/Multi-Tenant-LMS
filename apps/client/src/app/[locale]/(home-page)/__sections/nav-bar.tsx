"use client";

import CardNav from "@/components/CardNav";
import React, { useEffect, useState, useRef } from "react";

const NavBar: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // ignore tiny scrolls
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current) {
        // scrolling down
        setHidden(true);
      } else {
        // scrolling up
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", href: "/about", ariaLabel: "About Company" },
        { label: "Careers", href: "/about", ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Projects",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", href: "/Projects", ariaLabel: "Featured Projects" },
        { label: "Case Studies", href: "/Projects", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Email", href: "/Contact", ariaLabel: "Email us" },
        { label: "Twitter", href: "/Contact", ariaLabel: "Twitter" },
        { label: "LinkedIn", href: "/Contact", ariaLabel: "LinkedIn" }
      ]
    }
  ];

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
    >
      <CardNav
        logo={"/images/logo.png"}
        logoAlt="Company Logo"
        items={items}
        baseColor="#fff"
        menuColor="#000"
        buttonBgColor="#111"
        buttonTextColor="#fff"
        ease="power3.out"
        className=" bg-transparent  "
      />
    </div>
  );
};

export default NavBar;
