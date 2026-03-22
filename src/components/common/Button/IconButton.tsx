import styled, { css, keyframes } from "styled-components";

type Size = "sm" | "md";
type Variant = "border" | "line" | "filled" | "lineFilled";
type Color = "white" | "red";
const colorPalette = {
  white: { main: "white" },
  red: { main: "#f08080" },
};

const sizeStyles = {
  sm: css`
    width: 20px;
    height: 20px;
    svg {
      width: 20px;
    }
  `,
  md: css`
    height: 50px;
    width: 50px;
    svg {
      width: 30px;
    }
  `,
};

const variantStyles = {
  filled: (color: { main: string }) => css`
    color: ${color.main};
    svg {
      fill: ${color.main};
    }
  `,
  line: (color: { main: string }) => css`
    color: ${color.main};
    svg {
      stroke: ${color.main};
    }
  `,
  lineFilled: (color: { main: string }) => css`
    color: ${color.main};
    svg {
      stroke: ${color.main};
      fill: ${color.main};
    }
  `,
  border: (color: { main: string }) => css`
    color: ${color.main};
    border: 2px solid ${color.main};
    border-radius: 50%;
    svg {
      fill: ${color.main};
    }
  `,
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 70%;
  height: 70%;
  border: 2px solid #ffffff40;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const StyledIconButton = styled.button<{
  $size?: Size;
  $variant?: Variant;
  $color?: Color;
  $isLoading?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
  background-color: transparent;
  ${(p) => sizeStyles[p.$size || "sm"]}
  ${(p) =>
    variantStyles[p.$variant || "filled"](colorPalette[p.$color || "white"])}

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $size?: Size;
  $variant?: Variant;
  $color?: Color;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function IconButton({ isLoading, children, ...props }: IconButtonProps) {
  return (
    <StyledIconButton disabled={isLoading} $isLoading={isLoading} {...props}>
      {isLoading ? <Spinner /> : children}
    </StyledIconButton>
  );
}
