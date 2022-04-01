import { Organization } from "../../api";
import { useData } from "../../data-context";
import { NamedComponent } from "../../types";

const OrganizationView: NamedComponent = function OrganizationView() {
  const { isLoading, data } = useData<{ organization: Organization }>(
    OrganizationView
  );

  if (isLoading) return <p>Loading data...</p>;
  if (!data) return <p>Error :(</p>;
  return (
    <>
      <h1>{data.organization.slug}</h1>
      <p>Name: {data.organization.name}</p>
    </>
  );
};

OrganizationView.displayName = "OrganizationView";

export default OrganizationView;
