import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
};

export function Button({ children }: ButtonProps): ReactNode {
  return (
    <button type="button" className="ship-button">
      {children}
    </button>
  );
}
