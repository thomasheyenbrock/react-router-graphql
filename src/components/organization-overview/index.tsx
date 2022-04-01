import { Link } from "react-router-dom";

import { Organization } from "../../api";
import { useData } from "../../data-context";
import { NamedComponent } from "../../types";

const OrganizationOverview: NamedComponent = function OrganizationOverview() {
  const { isLoading, data } = useData<{
    organizations: Pick<Organization, "id" | "slug">[];
  }>(OrganizationOverview);

  if (isLoading) return <p>Loading data...</p>;
  if (!data) return <p>Error :(</p>;

  return (
    <>
      <h1>Organizations</h1>
      <ul>
        {data.organizations.map((org) => (
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
