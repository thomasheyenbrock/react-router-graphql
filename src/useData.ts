import {
  DefinitionNode,
  DocumentNode,
  FragmentSpreadNode,
  Kind,
  OperationTypeNode,
} from "graphql";
import { useEffect, useMemo, useState } from "react";
import { Location, matchRoutes, useLocation } from "react-router-dom";

import { fetch } from "./api";
import { DataStore, useDataContext } from "./data-context";
import { ExtendedRouteObject, routes } from "./routes";
import { Args, NamedComponent } from "./types";

function extractFragments(component: NamedComponent, location: Location) {
  const matches = matchRoutes(routes, location);
  if (!matches) return [];

  const routeFragments: {
    fragment: DocumentNode;
    args: Args;
    route: string;
  }[] = [];
  for (const match of matches) {
    const route = match.route as ExtendedRouteObject;

    // Nothing to do
    if (!route.query) continue;

    // We already found the route in a previous match
    if (routeFragments.length > 0) {
      if (route.query.shouldRun) {
        // This child route wants to execute the query themselves,
        // so stop adding fragments
        break;
      } else {
        // This child route wants its query executed by the nearest
        // parent, so add the fragment.
        routeFragments.push({
          fragment: route.query.fragment,
          args: route.query.args,
          route: match.pathname,
        });
        continue;
      }
    }

    if (route.componentName !== component.displayName)
      // The current match does not correspond to this component
      continue;

    // This component does not want to execute the query
    if (!route.query.shouldRun) break;

    routeFragments.push({
      fragment: route.query.fragment,
      args: route.query.args,
      route: match.pathname,
    });
  }

  return routeFragments;
}

function combineFragmentsIntoQuery(
  fragmentsAndArgs: { fragment: DocumentNode; args: Args }[]
) {
  const querySelections: FragmentSpreadNode[] = [];
  const definitions: DefinitionNode[] = [
    {
      kind: Kind.OPERATION_DEFINITION,
      operation: OperationTypeNode.QUERY,
      variableDefinitions: fragmentsAndArgs.flatMap(({ args }) =>
        args.map(({ name, type }) => ({
          kind: Kind.VARIABLE_DEFINITION,
          variable: {
            kind: Kind.VARIABLE,
            name: { kind: Kind.NAME, value: name },
          },
          type,
        }))
      ),
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: querySelections,
      },
    },
  ];
  for (const { fragment, args } of fragmentsAndArgs) {
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
    }
  }

  const query: DocumentNode = { kind: Kind.DOCUMENT, definitions };
  return query;
}

export function useData<Data extends Record<string, any>>(
  component: NamedComponent,
  variableValues?: Record<string, unknown>
) {
  const { data, setData } = useDataContext();

  const location = useLocation();
  const matches = useMemo(() => matchRoutes(routes, location), [location]);

  const pathname = matches?.find((match) => {
    const route = match.route as ExtendedRouteObject;
    return route.componentName === component.displayName;
  })?.pathname;

  const [activePromise, setActivePromise] = useState<Promise<void> | null>(
    null
  );

  useEffect(() => {
    if (!matches) return;

    const routeFragments = extractFragments(component, location);
    if (routeFragments.length === 0) return;

    const query = combineFragmentsIntoQuery(routeFragments);
    setActivePromise(
      fetch<Data>(query, variableValues).then((result) => {
        console.log(result);
        setActivePromise(null);

        const newData: DataStore = {};
        for (const { route } of routeFragments) {
          // Currently the whole data returned is stored for each route. This
          // means that there is probably more data available than the route
          // actually requested.
          newData[route] = result.data;
        }
        setData(newData);
      })
    );
  }, [component, location, matches]);

  return {
    isLoading: activePromise !== null && pathname && !data[pathname],
    result: pathname ? { data: data[pathname] as Data } : null,
  };
}
