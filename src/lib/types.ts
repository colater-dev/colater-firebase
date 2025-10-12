export interface CardData {
  id: string;
  type: "brand-name" | "elevator-pitch" | "audience";
  position: { x: number; y: number };
  width: number;
  height: number;
  data: { [key: string]: any };
  connections?: string[];
}
