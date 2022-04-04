import { Organization } from "../../api";
import { State, useData } from "../../data-context";
import { NamedComponent } from "../../types";

const OrganizationView: NamedComponent = function OrganizationView() {
  const request = useData<{ organization: Organization }>(OrganizationView);

  if (request.state === State.FETCHING) return <p>Loading data...</p>;
  if (!request.hasData) return <p>Error :(</p>;
  return (
    <>
      <h1>{request.data.organization.slug}</h1>
      <p>Name: {request.data.organization.name}</p>
    </>
  );
};

OrganizationView.displayName = "OrganizationView";

export default OrganizationView;
