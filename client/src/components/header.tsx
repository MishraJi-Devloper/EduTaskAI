import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { User } from "@/lib/types";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
          {user.fullName.charAt(0)}
        </div>
        <div>
          <h2 className="text-sm font-semibold dark:text-white">{user.fullName}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.fieldOfStudy}</p>
        </div>
      </div>
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="icon"
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <i className="ri-moon-line text-xl dark:hidden"></i>
        <i className="ri-sun-line text-xl hidden dark:block text-yellow-400"></i>
      </Button>
    </header>
  );
}
