import { Link } from "react-router-dom";
import { Organization } from "../../api";

import { NamedComponent } from "../../types";
import { useData } from "../../useData";

const OrganizationOverview: NamedComponent = function OrganizationOverview() {
  const { isLoading, result } =
    useData<{ organizations: Pick<Organization, "id" | "slug">[] }>(
      OrganizationOverview
    );

  if (isLoading) return <p>Loading data...</p>;
  if (!result?.data) return <p>Error :(</p>;

  return (
    <>
      <h1>Organizations</h1>
      <ul>
        {result.data.organizations.map((org) => (
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
