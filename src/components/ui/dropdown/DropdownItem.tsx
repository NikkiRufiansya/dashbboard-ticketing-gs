import type React from "react";
import { Link, LinkProps } from "react-router-dom";

interface BaseDropdownItemProps {
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  children: React.ReactNode;
  icon?: string;
}

type DropdownItemAsButton = BaseDropdownItemProps & {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type DropdownItemAsLink = BaseDropdownItemProps & {
  as: 'a';
  to: string;
} & LinkProps;

type DropdownItemAsCustom = BaseDropdownItemProps & {
  as: React.ElementType;
  [key: string]: any;
};

type DropdownItemProps = DropdownItemAsButton | DropdownItemAsLink | DropdownItemAsCustom;

// Icon component for dropdown items
const DropdownIcon = ({ name }: { name: string }) => {
  // You can replace this with your actual icon implementation
  return <span className="w-5 h-5 mr-2">{name}</span>;
};

export const DropdownItem: React.FC<DropdownItemProps> = (props) => {
  const {
    as: Component = 'button',
    onClick,
    onItemClick,
    className = "",
    children,
    icon,
    ...rest
  } = props as any; // Type assertion needed due to the union type

  const handleClick = (event: React.MouseEvent) => {
    if (onClick) onClick(event);
    if (onItemClick) onItemClick();
  };

  const baseClasses = "flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  // If using 'as' prop with a custom component
  if (typeof Component !== 'string') {
    return (
      <Component
        className={combinedClasses}
        onClick={handleClick}
        {...rest}
      >
        {icon && <DropdownIcon name={icon} />}
        {children}
      </Component>
    );
  }

  // For button or link
  if (Component === 'a' && 'to' in props) {
    const { to, ...linkProps } = props as DropdownItemAsLink;
    return (
      <Link
        to={to}
        className={combinedClasses}
        onClick={handleClick}
        {...linkProps}
      >
        {icon && <DropdownIcon name={icon} />}
        {children}
      </Link>
    );
  }

  // Default to button
  const { type = 'button', ...buttonProps } = rest as any;
  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={handleClick}
      {...buttonProps}
    >
      {icon && <DropdownIcon name={icon} />}
      {children}
    </button>
  );
};
