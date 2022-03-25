import { User } from "../../api";
import { NamedComponent } from "../../types";

import { useData } from "../../useData";

const Settings: NamedComponent = function Settings() {
  const { isLoading, result } = useData<{ user: User }>(Settings);

  if (isLoading) return <p>Loading data...</p>;
  if (!result?.data) return <p>Error :(</p>;
  return (
    <>
      <h1>Settings</h1>
      <p>Username: {result.data.user.fullName}</p>
    </>
  );
};

Settings.displayName = "Settings";

export default Settings;
