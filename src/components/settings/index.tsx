import { User } from "../../api";
import { State, useData } from "../../data-context";
import { NamedComponent } from "../../types";

const Settings: NamedComponent = function Settings() {
  const request = useData<{ user: User }>(Settings);

  if (request.state === State.FETCHING) return <p>Loading data...</p>;
  if (!request.hasData) return <p>Error :(</p>;
  return (
    <>
      <h1>Settings</h1>
      <p>Username: {request.data.user.fullName}</p>
    </>
  );
};

Settings.displayName = "Settings";

export default Settings;
