import { Args } from "../../types";

export const queryFragment = /* GraphQL */ `
  fragment SettingsData on Query {
    user {
      id
      fullName
    }
  }
`;

export const args: Args = [];
