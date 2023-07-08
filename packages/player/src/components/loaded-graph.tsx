import * as React from "react";
import { RingComponentProps } from "../types";
import { filledSector } from "@waw/svg";

type LoadedGraphProps = RingComponentProps & {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: string;
  style?: {};
  onClick?(evt: React.MouseEvent<SVGPathElement>): void;
};

const LoadedGraph: React.FC<LoadedGraphProps> = ({
  annulus,
  sector,
  ...props
}: LoadedGraphProps) => <path {...props} d={filledSector(annulus, sector)} />;

export default LoadedGraph;
