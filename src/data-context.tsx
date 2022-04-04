import {
  DefinitionNode,
  DocumentNode,
  FragmentSpreadNode,
  GraphQLError,
  Kind,
  OperationTypeNode,
  VariableDefinitionNode,
} from "graphql";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { matchRoutes, RouteMatch, useLocation } from "react-router-dom";
import { fetch } from "./api";

import { ExtendedRouteObject, routes } from "./routes";
import { Args, NamedComponent } from "./types";

type Pathname = string;
type Data = Record<string, unknown> | null | undefined;
export enum State {
  "EMPTY",
  "FETCHING",
  "REFETCHING",
  "DATA",
  "ERROR",
}
type GraphQLRequest<D extends Data = Data> =
  | { state: State.EMPTY; hasData: false }
  | { state: State.FETCHING; hasData: false }
  | {
      state: State.REFETCHING;
      hasData: boolean;
      data: D;
      errors: GraphQLError[] | null;
    }
  | { state: State.DATA; hasData: boolean; data: D }
  | { state: State.ERROR; hasData: boolean; data: D; errors: GraphQLError[] };
export type DataStore = Record<Pathname, GraphQLRequest>;

function setRefetching(request: GraphQLRequest) {
  request.state = State.REFETCHING;
}

function setData(request: GraphQLRequest, data: Data) {
  request.state = State.DATA;
  request.hasData = !!data;
  (request as any).data = data;
}

function setErrors(
  request: GraphQLRequest,
  errors: readonly GraphQLError[],
  data: Data
) {
  request.state = State.ERROR;
  request.hasData = !!data;
  (request as any).data = data;
  (request as any).errors = errors;
}

const DataContext = createContext<DataStore>({});

type FragmentWithArgs = {
  fragment: DocumentNode;
  args: Args;
  match: RouteMatch;
};

function combineFragmentsIntoQuery(fragmentsWithArgs: FragmentWithArgs[]) {
  const pathnames: string[] = [];
  const querySelections: FragmentSpreadNode[] = [];
  const variableDefinitions: VariableDefinitionNode[] = [];
  const definitions: DefinitionNode[] = [
    {
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      variableDefinitions,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: querySelections,
      },
    },
  ];
  const variableValues: Record<string, unknown> = {};
  for (const { fragment, args, match } of fragmentsWithArgs) {
    pathnames.push(match.pathname);

    for (const definition of fragment.definitions) {
      // Include all definitions of the fragment document in the
      // query document
      definitions.push(definition);

      if (
        definition.kind === Kind.FRAGMENT_DEFINITION &&
        definition.typeCondition.name.value === "Query"
      ) {
        // If the fragment is defined on the root `Query` type,
        // spread it into the query operation definition.
        querySelections.push({
          kind: Kind.FRAGMENT_SPREAD,
          name: { kind: Kind.NAME, value: definition.name.value },
        });
      }

      for (const arg of args) {
        variableDefinitions.push({
          kind: Kind.VARIABLE_DEFINITION,
          variable: {
            kind: Kind.VARIABLE,
            name: { kind: Kind.NAME, value: arg.name },
          },
          type: arg.type,
        });
        variableValues[arg.name] = arg.getValue(match);
      }
    }
  }

  const query: DocumentNode = { kind: Kind.DOCUMENT, definitions };
  return { pathnames, query, variables: variableValues };
}

export function DataContextProvider(props: { children: React.ReactNode }) {
  const [store, setStore] = useState<DataStore>({});

  const location = useLocation();

  useEffect(() => {
    const matches = matchRoutes(routes, location);
    if (!matches) return;

    const fragmentsWithArgs: FragmentWithArgs[][] = [];
    for (const match of matches) {
      if (!match.route) continue;
      const route = match.route as ExtendedRouteObject;

      // This route has no data requirements
      if (!route.query) continue;

      // This route is in charge of running an aggregated query
      if (route.query.shouldRun) fragmentsWithArgs.push([]);

      // There already is data for this route in the store
      if (route.componentName && route.componentName in store) continue;

      fragmentsWithArgs[fragmentsWithArgs.length - 1].push({
        match,
        fragment: route.query.fragment,
        args: route.query.args,
      });
    }

    const queries = fragmentsWithArgs.map(combineFragmentsIntoQuery);

    setStore((currentStore) => {
      const updatedStore = { ...currentStore };
      for (const { pathnames } of queries) {
        for (const pathname of pathnames) {
          if (updatedStore[pathname]) {
            setRefetching(updatedStore[pathname]);
          } else {
            updatedStore[pathname] = { state: State.FETCHING, hasData: false };
          }
        }
      }
      return updatedStore;
    });

    for (const { pathnames, query, variables } of queries) {
      fetch(query, variables).then((result) => {
        setStore((currentStore) => {
          const updatedStore = { ...currentStore };
          for (const pathname of pathnames) {
            if (result.errors) {
              setErrors(updatedStore[pathname], result.errors, result.data);
            } else {
              setData(updatedStore[pathname], result.data);
            }
          }
          return updatedStore;
        });
      });
    }
  }, [location]);

  return (
    <DataContext.Provider value={store}>{props.children}</DataContext.Provider>
  );
}

export function useData<D extends Data>(
  component: NamedComponent
): GraphQLRequest<D> {
  const location = useLocation();
  const matches = useMemo(() => matchRoutes(routes, location), [location]);

  const pathname = matches?.find((match) => {
    const route = match.route as ExtendedRouteObject;
    return route.componentName === component.displayName;
  })?.pathname;
  if (!pathname) return { state: State.EMPTY, hasData: false };

  const store = useContext(DataContext);
  return (
    (store[pathname] as GraphQLRequest<D>) || {
      state: State.EMPTY,
      hasData: false,
    }
  );
}
