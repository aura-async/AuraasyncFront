"use client";

import React from "react";
import Link from "next/link";
import { FaMapMarkerAlt, FaEnvelope, FaComments } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1a1a1a]  bottom-0 overflow-y-hidden">
      {/* Main footer content - dark grey rounded rectangle */}
      <div className="  w-full bg-[#333333] rounded-t-[40px] pt-10  sm:pt-12 sm:pb-8">
        {/* Content container with max-width and centered */}
        <div className="max-w-[1200px] mx-auto px-5 relative z-10">
          {/* Four column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 lg:gap-24 xl:gap-28 mb-20">
            {/* Useful Column */}
            <div className="space-y-8">
              <h3 className="text-white font-semibold text-xl mb-8">Useful</h3>
              <ul className="space-y-6">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analysis-v2/force"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Faq&apos;s
                  </Link>
                </li>
              </ul>
            </div>

            {/* Socials Column */}
            <div className="space-y-8">
              <h3 className="text-white font-semibold text-xl mb-8">Socials</h3>
              <ul className="space-y-6">
                <li>
                  <a
                    href="https://www.instagram.com/auraasync_official?igsh=ZG9pNWRhZGljMHc3 "
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/company/auraasync/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Linkedin
                  </a>
                </li>
                <li>
                  {/* <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Ayraa
                  </a> */}
                </li>
              </ul>
            </div>

            {/* Contact Us Column */}
            <div className="space-y-8">
              <div className="flex items-center mb-8">
                <h3 className="text-white font-semibold text-xl mr-3">
                  Contact Us
                </h3>
                <FaComments className="text-white text-xl" />
              </div>
              <div className="space-y-7">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-300 mt-1 mr-4 flex-shrink-0 text-base" />
                  <span className="text-gray-300 text-base">
                    Mumbai 400 015, Maharashtra India
                  </span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-300 mr-4 flex-shrink-0 text-base" />
                  <span className="text-gray-300 text-base">
                    auraasync@gmail.com
                  </span>
                </div>
                {/* Feedback button → navigates to on-site feedback form */}
                <div>
                  <Link
                    href="/feedback"
                    className="inline-block px-5 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                  >
                    Send Feedback
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal Column */}
            <div className="space-y-8">
              <h3 className="text-white font-semibold text-xl mb-8">Legal</h3>
              <ul className="space-y-6">
                <li>
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Terms & condition
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-base"
                  >
                    Privacy policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large semi-transparent brand name */}
       <div className="relative z-10 text-center overflow-visible -mb-[1vh] md:-mb-[8vh]">
  <h1 className="text-[16vw] lg:text-[18vw] font-bold text-[#555555] leading-none tracking-tight">
    AuraaSync
  </h1>
</div>
      </div>
    </footer>
  );
};

export default Footer;
