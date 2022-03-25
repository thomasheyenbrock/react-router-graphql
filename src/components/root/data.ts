import { Args } from "../../types";

export const queryFragment = /* GraphQL */ `
  fragment RootData on Query {
    organizations {
      id
      slug
    }
  }
`;

export const args: Args = [];
