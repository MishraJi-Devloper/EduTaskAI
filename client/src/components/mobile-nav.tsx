import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/lib/constants";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around py-3 z-10">
      {NAV_ITEMS.map((item, index) => (
        <Link href={item.href} key={index}>
          <div
            className={`flex flex-col items-center cursor-pointer ${
              location === item.href
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <i className={`${item.icon} text-xl`}></i>
            <span className="text-xs mt-1">{item.name}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
