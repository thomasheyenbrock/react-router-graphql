import {
  DocumentNode,
  ExecutionResult,
  graphql,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  print,
} from "graphql";

import { delay } from "./utils/delay";

type Maybe<T> = T | null;

export type User = { id: Maybe<number>; fullName: Maybe<string> };

const user: User = { id: 42, fullName: "Thomas Heyenbrock" };

export type Organization = { id: Maybe<string>; slug: string; name: string };

const organizations: Organization[] = [
  { id: "qwe", slug: "swapi", name: "Star Wars API" },
  { id: "asd", slug: "spacex", name: "SpaceX API" },
];

const Organization = new GraphQLObjectType({
  name: "Organization",
  fields: {
    id: { type: GraphQLString },
    slug: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const User = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLInt },
    fullName: { type: GraphQLString },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      organizations: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(Organization))
        ),
        resolve: () => organizations,
      },
      organization: {
        type: Organization,
        args: {
          slug: { type: GraphQLString },
        },
        resolve: (root, args) =>
          organizations.find((org) => org.slug === args.slug),
      },
      user: { type: User, resolve: () => user },
    },
  }),
});

export async function fetch<Data extends Record<string, any>>(
  query: DocumentNode,
  variableValues?: Record<string, unknown>
) {
  await delay();
  const source = print(query);
  console.log(source);
  const result = await graphql({ schema, source, variableValues });
  return result as ExecutionResult<Data>;
}
