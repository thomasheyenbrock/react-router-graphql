import { useParams } from "react-router-dom";
import { Organization } from "../../api";

import { NamedComponent } from "../../types";
import { useData } from "../../useData";

const OrganizationView: NamedComponent = function OrganizationView() {
  const params = useParams();
  const { isLoading, result } = useData<{ organization: Organization }>(
    OrganizationView,
    { orgSlug: params.orgSlug }
  );

  if (isLoading) return <p>Loading data...</p>;
  if (!result?.data) return <p>Error :(</p>;
  return (
    <>
      <h1>{result.data.organization.slug}</h1>
      <p>Name: {result.data.organization.name}</p>
    </>
  );
};

OrganizationView.displayName = "OrganizationView";

export default OrganizationView;
