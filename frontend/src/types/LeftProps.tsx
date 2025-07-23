import { JSX } from "react";

interface LeftEntry {
  title: string;
  action: () => void;
  icon: JSX.Element;
  color?: string;
  disabled?: boolean;
}

export default interface LeftProps {
  entries: LeftEntry[];
}
