"use client";

import { Home, Search, User, UserCircle } from "lucide-react";
import Image from "next/image";
import HairIcon from '@/app/assets/iconHair.png'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/male' && pathname === '/male') return true;
    if (path !== '/male' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-10 rounded-[35px] left-1/2 transform -translate-x-1/2  w-[70vw] md:w-[30vw] z-50 bg-neutral-800 text-white border-t border-gray-600">
      <div className="flex items-center justify-around px-4 py-5">
        {/* Home */}
        <Link 
          href="/male" 
          className={`flex flex-col items-center space-y-1 transition-colors ${
            isActive('/male') ? 'text-blue-400' : 'text-white hover:text-blue-400'
          }`}
        >
          <Home className="h-8 w-8" />
          {/* <span className="text-xs">Home</span> */}
        </Link>

        {/* Dashboard */}
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center space-y-1 transition-colors ${
            isActive('/dashboard') ? 'text-blue-400' : 'text-white hover:text-blue-400'
          }`}
        >
          <UserCircle className="h-8 w-8" />
          {/* <span className="text-xs">Dashboard</span> */}
        </Link>

        {/* Search */}
        <Link 
          href="/search" 
          className={`flex flex-col items-center space-y-1 transition-colors ${
            isActive('/search') ? 'text-blue-400' : 'text-white hover:text-blue-400'
          }`}
        >
          <Search className="h-8 w-8" />
          {/* <span className="text-xs">Search</span> */}
        </Link>

        {/* Hairstyle */}
        <Link 
          href="/hairstyle" 
          className={`flex flex-col items-center space-y-1 transition-colors ${
            isActive('/hairstyle') ? 'text-blue-400' : 'text-white hover:text-blue-400'
          }`}
        >
          <Image src={HairIcon} width={24} height={24} alt="hair icon" className="h-6 w-6"/>
          {/* <span className="text-xs">Hairstyle</span> */}
        </Link>

        {/* Profile */}
        {/* <Link 
          href="/profile" 
          className={`flex flex-col items-center space-y-1 transition-colors ${
            isActive('/profile') ? 'text-blue-400' : 'text-white hover:text-blue-400'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link> */}
      </div>
    </nav>
  );
}
