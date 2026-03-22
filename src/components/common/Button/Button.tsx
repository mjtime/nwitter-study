import React from "react";
import {
  StyledButton,
  type ButtonVariant,
  type ButtonSize,
} from "./Button.styles";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
  to?: string;
  htmlFor?: string;
  active?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "submit",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      as,
      ...rest
    },
    ref,
  ) => {
    return (
      <StyledButton
        type={rest.type ?? "button"}
        ref={ref}
        as={as}
        $variant={variant}
        $size={size}
        disabled={isLoading || disabled}
        {...rest}
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </StyledButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
