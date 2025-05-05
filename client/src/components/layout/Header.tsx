import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { SunnahLogo } from "@/components/ui/sunnahlogo";

type NavLink = {
  name: string;
  path: string;
  dropdown?: Array<{ name: string; path: string; hash?: string }>;
};

const navigation: NavLink[] = [
  { name: "Home", path: "/" },
  {
    name: "About Us",
    path: "/about",
    dropdown: [
      { name: "Our Mission", path: "/about", hash: "#mission" },
      { name: "Our Team", path: "/about", hash: "#team" },
      { name: "History", path: "/about", hash: "#history" },
    ],
  },
  {
    name: "Our Programs",
    path: "/programs",
    dropdown: [
      { name: "Youth Development", path: "/programs", hash: "#youth" },
      { name: "Community Services", path: "/programs", hash: "#community" },
      { name: "Educational Programs", path: "/programs", hash: "#education" },
    ],
  },
  { name: "Sunnah University", path: "/university" },
  { name: "Daewa TV", path: "/daewa-tv" },
  { name: "Get Involved", path: "/get-involved" },
  { name: "News", path: "/news" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<string, boolean>>({});

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (name: string) => {
    setExpandedDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <SunnahLogo className="h-16" />
            </a>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-secondary focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          <i className="fas fa-bars text-2xl"></i>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navigation.map((item) => (
            <div key={item.name} className={item.dropdown ? "relative group" : ""}>
              <Link href={item.path}>
                <a className="text-secondary hover:text-primary font-semibold flex items-center transition duration-150">
                  {item.name} {item.dropdown && <i className="fas fa-chevron-down ml-1 text-xs"></i>}
                </a>
              </Link>
              {item.dropdown && (
                <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                  <div className="py-1">
                    {item.dropdown.map((dropdownItem) => (
                      <Link key={dropdownItem.name} href={`${dropdownItem.path}${dropdownItem.hash || ''}`}>
                        <a className="block px-4 py-2 text-sm text-secondary hover:bg-cream">
                          {dropdownItem.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <Link href="/get-involved#donate">
          <a className="hidden md:block bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
            Donate
          </a>
        </Link>
      </div>

      {/* Mobile Navigation */}
      <nav className={`bg-white md:hidden border-t border-gray-200 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.dropdown ? (
                <>
                  <button 
                    className="w-full text-left px-3 py-2 text-secondary font-semibold hover:bg-cream rounded-md flex justify-between items-center"
                    onClick={() => toggleDropdown(item.name)}
                  >
                    {item.name} 
                    <i className={`fas ${expandedDropdowns[item.name] ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
                  </button>
                  <div className={`pl-4 space-y-1 ${expandedDropdowns[item.name] ? 'block' : 'hidden'}`}>
                    {item.dropdown.map((dropdownItem) => (
                      <Link key={dropdownItem.name} href={`${dropdownItem.path}${dropdownItem.hash || ''}`}>
                        <a className="block px-3 py-2 text-secondary hover:bg-cream rounded-md">
                          {dropdownItem.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={item.path}>
                  <a className="block px-3 py-2 text-secondary font-semibold hover:bg-cream rounded-md">
                    {item.name}
                  </a>
                </Link>
              )}
            </div>
          ))}
          <div className="pt-2">
            <Link href="/get-involved#donate">
              <a className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-full transition duration-150 block text-center">
                Donate
              </a>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
