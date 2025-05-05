import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { SunnahLogo } from "@/components/ui/sunnahlogo";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";

type NavLink = {
  name: string;
  path: string;
  dropdown?: Array<{ name: string; path: string; hash?: string }>;
};

type NavLinkExternal = NavLink & { external?: boolean; featured?: boolean };

// Reorganized navigation with grouping
const navigation: NavLinkExternal[] = [
  { name: "Home", path: "/" },
  // Main sections group
  {
    name: "About",
    path: "/about",
    dropdown: [
      { name: "Our Mission", path: "/about", hash: "#mission" },
      { name: "Our Team", path: "/about", hash: "#team" },
      { name: "History", path: "/about", hash: "#history" },
    ],
  },
  {
    name: "Programs",
    path: "/programs",
    dropdown: [
      { name: "Community Services", path: "/programs", hash: "#community" },
      { name: "Educational Programs", path: "/programs", hash: "#education" },
    ],
  },
  { name: "University", path: "/university" },
  
  // Resources & Media group
  { name: "Daewa TV", path: "https://daewatv.comm", external: true },
  { name: "Events", path: "/events" },
  { name: "News", path: "/news" },
  
  // Action items
  { name: "Get Involved", path: "/get-involved", featured: true },
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

  // Group navigation items for better organization
  const mainNavItems = navigation.slice(0, 4); // Home, About, Programs, University
  const resourcesNavItems = navigation.slice(4, 7); // Daewa TV, Events, News
  const actionNavItems = navigation.slice(7); // Get Involved, Contact

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <SunnahLogo className="h-16" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden text-secondary focus:outline-none flex items-center"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div className="flex space-x-1 mr-8">
            {/* Main Nav Group */}
            {mainNavItems.map((item) => (
              <div key={item.name} className={`relative group px-3 py-2 ${location === item.path ? 'text-primary' : 'text-secondary'}`}>
                {item.external ? (
                  <a 
                    href={item.path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary font-medium flex items-center transition duration-150"
                  >
                    {item.name} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                ) : (
                  <Link href={item.path} className="hover:text-primary font-medium flex items-center transition duration-150">
                    {item.name} {item.dropdown && <ChevronDown className="ml-1 h-4 w-4" />}
                  </Link>
                )}
                {item.dropdown && (
                  <div className="absolute z-10 left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                    <div className="py-1">
                      {item.dropdown.map((dropdownItem) => (
                        <Link key={dropdownItem.name} href={`${dropdownItem.path}${dropdownItem.hash || ''}`} className="block px-4 py-2 text-sm text-secondary hover:bg-cream">
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex space-x-1 mr-8">
            {/* Resources Nav Group */}
            {resourcesNavItems.map((item) => (
              <div key={item.name} className={`relative group px-3 py-2 ${location === item.path ? 'text-primary' : 'text-secondary'}`}>
                {item.external ? (
                  <a 
                    href={item.path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary font-medium flex items-center transition duration-150"
                  >
                    {item.name} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                ) : (
                  <Link href={item.path} className="hover:text-primary font-medium flex items-center transition duration-150">
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex space-x-1">
            {/* Action Nav Group */}
            {actionNavItems.map((item) => (
              <div key={item.name} className={`relative group px-3 py-2 ${location === item.path ? 'text-primary' : 'text-secondary'}`}>
                <Link 
                  href={item.path} 
                  className={`hover:text-primary font-medium transition duration-150 ${
                    item.featured ? 'text-primary font-semibold' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </nav>

        <Link href="/get-involved#donate" className="hidden md:block bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
          Donate
        </Link>
      </div>

      {/* Mobile Navigation - Updated with grouping */}
      <nav className={`bg-white md:hidden border-t border-gray-200 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-4">
          {/* Main navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <button 
                      className="w-full text-left px-3 py-2 text-secondary font-semibold hover:bg-cream rounded-md flex justify-between items-center"
                      onClick={() => toggleDropdown(item.name)}
                    >
                      {item.name} 
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedDropdowns[item.name] ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`pl-4 space-y-1 ${expandedDropdowns[item.name] ? 'block' : 'hidden'}`}>
                      {item.dropdown.map((dropdownItem) => (
                        <Link 
                          key={dropdownItem.name} 
                          href={`${dropdownItem.path}${dropdownItem.hash || ''}`} 
                          className="block px-3 py-2 text-secondary hover:bg-cream rounded-md"
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : item.external ? (
                  <a 
                    href={item.path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-3 py-2 text-secondary font-semibold hover:bg-cream rounded-md flex items-center"
                  >
                    {item.name} <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                ) : (
                  <Link href={item.path} className={`block px-3 py-2 font-semibold hover:bg-cream rounded-md ${location === item.path ? 'bg-cream text-primary' : 'text-secondary'}`}>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* Resources & Media section with label */}
          <div>
            <div className="px-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Resources & Media</div>
            <div className="space-y-1">
              {resourcesNavItems.map((item) => (
                <div key={item.name}>
                  {item.external ? (
                    <a 
                      href={item.path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block px-3 py-2 text-secondary font-semibold hover:bg-cream rounded-md flex items-center"
                    >
                      {item.name} <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  ) : (
                    <Link href={item.path} className={`block px-3 py-2 font-semibold hover:bg-cream rounded-md ${location === item.path ? 'bg-cream text-primary' : 'text-secondary'}`}>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action items section with label */}
          <div>
            <div className="px-3 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Get Involved</div>
            <div className="space-y-1">
              {actionNavItems.map((item) => (
                <div key={item.name}>
                  <Link 
                    href={item.path} 
                    className={`block px-3 py-2 font-semibold hover:bg-cream rounded-md ${
                      item.featured ? 'text-primary' : location === item.path ? 'bg-cream text-primary' : 'text-secondary'
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <Link href="/get-involved#donate" className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-full transition duration-150 block text-center">
              Donate Now
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
