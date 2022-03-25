import { Kind } from "graphql";
import { Args } from "../../types";

export const queryFragment = /* GraphQL */ `
  fragment OrganizationViewData on Query {
    organization(slug: $orgSlug) {
      id
      slug
      name
    }
  }
`;

export const args: Args = [
  {
    name: "orgSlug",
    type: { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: "String" } },
  },
];
