import {
  DefinitionNode,
  DocumentNode,
  ExecutionResult,
  FragmentSpreadNode,
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
type State<D extends Data = Data> = {
  isLoading: boolean;
  data: D;
  errors: ExecutionResult["errors"];
};
export type DataStore = Record<Pathname, State>;

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
    console.log(queries);

    setStore((currentStore) => {
      const updatedStore = { ...currentStore };
      for (const { pathnames } of queries) {
        for (const pathname of pathnames) {
          if (updatedStore[pathname]) {
            updatedStore[pathname].isLoading = true;
          } else {
            updatedStore[pathname] = {
              isLoading: true,
              data: null,
              errors: undefined,
            };
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
            updatedStore[pathname].isLoading = false;
            updatedStore[pathname].data = result.data;
            updatedStore[pathname].errors = result.errors;
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

export function useData<D extends Data>(component: NamedComponent) {
  const location = useLocation();
  const matches = useMemo(() => matchRoutes(routes, location), [location]);

  const emptyState = { isLoading: false, data: null, errors: undefined };

  const pathname = matches?.find((match) => {
    const route = match.route as ExtendedRouteObject;
    return route.componentName === component.displayName;
  })?.pathname;
  if (!pathname) return emptyState;

  const store = useContext(DataContext);
  return (store[pathname] as State<D>) || emptyState;
}
