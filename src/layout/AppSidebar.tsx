import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // harus pakai react-router-dom
import { GridIcon, ChevronDownIcon, TableIcon, FileIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string;
  subItems?: {
    name: string;
    path: string;
    badge?: string;
    new?: boolean;
    pro?: boolean;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/home",
  },
  {
    icon: <TableIcon />,
    name: "Ticket",
    subItems: [
      { name: "All Ticket", path: "/tickets", badge: "all" },
      { name: "Open Ticket", path: "/tickets-open", badge: "open" },
      { name: "Closed Ticket", path: "/tickets-closed", badge: "closed" },
    ],
  },
  {
    icon: <FileIcon />,
    name: "Report",
    path: "/reports/print"
  },
  // Only show Users menu for admin
  // ...(JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' ? [{
  //   icon: <UserIcon />,
  //   name: "Users",
  //   path: "/users",
  // }] : []),

  



];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main"; index: number } | null>(null);
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});



  const isActive = useCallback(
    (path: string) => {
      const pathWithoutQuery = path.split("?")[0];
      
      // For the main Tickets menu item, check if we're on any tickets page
      if (path === '/tickets') {
        return location.pathname === '/tickets' || 
               location.pathname.startsWith('/tickets/') ||
               (location.pathname === '/tickets' && location.search !== '');
      }
      
      // For submenu items, check if the current path matches exactly
      return location.pathname === pathWithoutQuery && 
             (path.includes('?') ? location.search === path.split('?')[1] : true);
    },
    [location.pathname, location.search]
  );

  // Auto expand submenu kalau ada item aktif
  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  // Update submenu height
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const toggleSubmenu = (type: "main", index: number) => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === type && prev.index === index) {
        return null;
      }
      return { type, index };
    });
  };

  const renderNavItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => toggleSubmenu("main", index)}
                className={`menu-item group ${
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>

              <div
                ref={(el) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? `${subMenuHeight[`main-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        {subItem.badge && (
                          <span
                            className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              isActive(subItem.path)
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              
              <h3 className="text-xl font-bold">Ticket Guardsquare</h3>
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderNavItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;