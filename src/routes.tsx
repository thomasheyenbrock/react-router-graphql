import { lazy, Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";

import * as organizationOverviewData from "./components/organization-overview/data";
import * as organizationViewData from "./components/organization-view/data";
import * as rootData from "./components/root/data";
import * as settingsData from "./components/settings/data";

import Root from "./components/root";
import { delay } from "./utils/delay";
import { DocumentNode, parse } from "graphql";
import { Args } from "./types";

async function importWithDelay(module: string) {
  await delay();
  return import(module);
}

const OrganizationOverview = lazy(() =>
  importWithDelay("./components/organization-overview")
);
const OrganizationView = lazy(() =>
  importWithDelay("./components/organization-view")
);
const Settings = lazy(() => importWithDelay("./components/settings"));

export interface ExtendedRouteObject extends RouteObject {
  query?: {
    fragment: DocumentNode;
    args: Args;
    shouldRun: boolean;
  };
  componentName?: string;
  children?: ExtendedRouteObject[];
}

export const routes: ExtendedRouteObject[] = [
  {
    path: "/",
    element: <Root />,
    componentName: "Root",
    query: {
      fragment: parse(rootData.queryFragment),
      args: rootData.args,
      shouldRun: true,
    },
    children: [
      {
        path: "organizations",

        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<p>Loading code...</p>}>
                <OrganizationOverview />
              </Suspense>
            ),
            componentName: "OrganizationOverview",
            query: {
              fragment: parse(organizationOverviewData.queryFragment),
              args: organizationOverviewData.args,
              shouldRun: false,
            },
          },
          {
            path: ":orgSlug",
            element: (
              <Suspense fallback={<p>Loading code...</p>}>
                <OrganizationView />
              </Suspense>
            ),
            componentName: "OrganizationView",
            query: {
              fragment: parse(organizationViewData.queryFragment),
              args: organizationViewData.args,
              shouldRun: true,
            },
          },
        ],
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<p>Loading code...</p>}>
            <Settings />
          </Suspense>
        ),
        componentName: "Settings",
        query: {
          fragment: parse(settingsData.queryFragment),
          args: settingsData.args,
          shouldRun: false,
        },
      },
      {
        index: true,
        element: <Navigate to="/organizations" />,
      },
    ],
  },
];
