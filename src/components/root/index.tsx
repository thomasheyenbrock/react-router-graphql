import { Link, Outlet } from "react-router-dom";

import { Organization } from "../../api";
import { useData } from "../../data-context";
import { NamedComponent } from "../../types";

const Root: NamedComponent = function Root() {
  const { isLoading, data } = useData<{
    organizations: Pick<Organization, "id" | "slug">[];
  }>(Root);

  if (isLoading) return <p>Loading data...</p>;
  if (!data) return <p>Error :(</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ borderRight: "1px solid black", padding: "8px" }}>
        <ul>
          <li>
            <Link to="/organizations">Organizations</Link>
            <ul>
              {data.organizations.map((org) => (
                <li key={org.id}>
                  <Link to={`/organizations/${org.slug}`}>{org.slug}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <main style={{ padding: "8px" }}>
        <Outlet />
      </main>
    </div>
  );
};

Root.displayName = "Root";

export default Root;
