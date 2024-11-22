import { DebugData } from "./Debug";

export interface Section {
  id: string;
  title: string;
  component: React.FC<{ onDebugData?: (data: DebugData) => void }>;
  height: string;
}
