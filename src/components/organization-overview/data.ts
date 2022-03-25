import { Args } from "../../types";

export const queryFragment = /* GraphQL */ `
  fragment OrganizationOverviewData on Query {
    organizations {
      id
      slug
    }
  }
`;

export const args: Args = [];
