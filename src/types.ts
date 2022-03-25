import { NamedTypeNode } from "graphql";

export type NamedComponent = React.ComponentType & { displayName: string };

export type Args = { name: string; type: NamedTypeNode }[];
