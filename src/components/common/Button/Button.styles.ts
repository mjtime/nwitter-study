import styled, { css } from "styled-components";

export type ButtonVariant =
  | "submit"
  | "upload"
  | "active_border"
  | "active_fill_border"
  | "active_nev_border"
  | "active_nev"
  | "active_pos";

export type ButtonSize = "sm" | "md" | "lg";

const colorPalette = {
  blue: {
    main: "#4898e3",
    assistance: "white",
  },
  basic: {
    main: "#ffffff80",
    assistance: "white",
  },
  white: {
    main: "white",
    assistance: "black",
  },
  red: {
    main: "#e36f6f",
    assistance: "white",
  },
  point_red: {
    main: "#e36f6f",
    assistance: "#ffffff80",
  },
  point_blue: {
    main: "#67cfff",
    assistance: "#ffffff80",
  },
};
const fillButton = (color: { main: string; assistance: string }) => css`
  background-color: ${color.main};
  color: ${color.assistance};
  border: none;
`;
const borderButton = (color: { main: string; assistance: string }) => css`
  background-color: transparent;
  color: ${color.main};
  border: 1px solid ${color.main};
  font-weight: 600;
`;

const textHoverButton = (color: { main: string; assistance: string }) => css`
  border: none;
  background-color: transparent;
  color: ${color.assistance};
  &:hover {
    color: ${color.main};
  }
`;

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  submit: fillButton(colorPalette.blue),
  upload: borderButton(colorPalette.blue),
  active_border: borderButton(colorPalette.white),
  active_fill_border: fillButton(colorPalette.white),
  active_nev_border: borderButton(colorPalette.red),
  active_nev: textHoverButton(colorPalette.point_red),
  active_pos: textHoverButton(colorPalette.point_blue),
};

const sizeStyles = {
  sm: css`
    padding: 3px 12px;
    font-size: 12px;
  `,
  md: css`
    padding: 10px 20px;
    font-size: 14px;
  `,
  lg: css`
    padding: 14px 28px;
    font-size: 16px;
  `,
};

export const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
}>`
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  transition:
    opacity 0.2s ease,
    transform 0.05s ease;

  ${(props) => variantStyles[props.$variant]}
  ${(props) => sizeStyles[props.$size]}

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
