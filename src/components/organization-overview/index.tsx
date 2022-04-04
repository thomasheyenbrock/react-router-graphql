import { Link } from "react-router-dom";

import { Organization } from "../../api";
import { State, useData } from "../../data-context";
import { NamedComponent } from "../../types";

const OrganizationOverview: NamedComponent = function OrganizationOverview() {
  const request = useData<{
    organizations: Pick<Organization, "id" | "slug">[];
  }>(OrganizationOverview);

  if (request.state === State.FETCHING) return <p>Loading data...</p>;
  if (!request.hasData) return <p>Error :(</p>;

  return (
    <>
      <h1>Organizations</h1>
      <ul>
        {request.data.organizations.map((org) => (
          <li key={org.id}>
            <Link to={org.slug}>{org.slug}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

OrganizationOverview.displayName = "OrganizationOverview";

export default OrganizationOverview;
