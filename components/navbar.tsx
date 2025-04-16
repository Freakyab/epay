"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "nextjs-toploader/app";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#604c2f]/70 to-[#a07b4a]/70 text-white flex justify-between items-center backdrop-filter backdrop-blur-lg shadow-lg px-6 py-3">
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold tracking-wider text-white cursor-pointer"
          onClick={() => router.push('/')}
        >ePay</div>
        
      </div>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors duration-300">
              <Avatar className="w-10 h-10 border-2 border-white/30">
                <AvatarImage 
                  src={user.image || "/default-avatar.png"} 
                  alt={user.name || "User Profile"}
                />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name || 'User'}</span>
                <span className="text-xs text-white/60">{user.email}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white text-black">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-100"
              onSelect={() => router.push('/orders')}
            >
              Orders
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-100"
              onSelect={() => router.push('/cart')}
            >
              Cart
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-100"
              onSelect={() => router.push('/listing')}
            >
              Listing Product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-red-50 text-red-600"
              onSelect={async () => await signOut()}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" className="bg-white/20 text-white hover:bg-white/30"
          onClick={() => router.push('/login')}
        >
          Login
        </Button>
      )}
    </nav>
  );
}

export default Navbar;