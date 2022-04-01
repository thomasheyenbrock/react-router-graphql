import { User } from "../../api";
import { useData } from "../../data-context";
import { NamedComponent } from "../../types";

const Settings: NamedComponent = function Settings() {
  const { isLoading, data } = useData<{ user: User }>(Settings);

  if (isLoading) return <p>Loading data...</p>;
  if (!data) return <p>Error :(</p>;
  return (
    <>
      <h1>Settings</h1>
      <p>Username: {data.user.fullName}</p>
    </>
  );
};

Settings.displayName = "Settings";

export default Settings;
