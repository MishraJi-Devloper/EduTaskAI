import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { NAV_ITEMS } from "@/lib/constants";
import { User } from "@/lib/types";
import { motion } from "framer-motion";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <aside className="hidden lg:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-3 mb-8"
        >
          <div className="bg-primary-600 text-white p-2 rounded-md">
            <i className="ri-graduation-cap-fill text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduTask AI</h1>
        </motion.div>
        
        <div className="space-y-1">
          {NAV_ITEMS.map((item, index) => (
            <Link href={item.href} key={index}>
              <div
                className={`flex items-center space-x-3 p-3 rounded-md transition-colors cursor-pointer ${
                  location === item.href
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-semibold dark:text-white">{user.fullName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.fieldOfStudy}</p>
          </div>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <i className="ri-moon-line text-lg dark:hidden"></i>
            <i className="ri-sun-line text-lg hidden dark:block text-yellow-400"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
