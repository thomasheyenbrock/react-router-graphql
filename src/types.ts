import { NamedTypeNode } from "graphql";
import { RouteMatch } from "react-router-dom";

export type NamedComponent = React.ComponentType & { displayName: string };

export type Args = {
  name: string;
  type: NamedTypeNode;
  getValue(match: RouteMatch): unknown;
}[];
