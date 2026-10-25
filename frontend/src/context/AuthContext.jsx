import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    if (nextUser) {
      localStorage.setItem("connectly-profile", JSON.stringify(nextUser));
      localStorage.setItem("connectly-demo-session", JSON.stringify({ name: nextUser.name, email: nextUser.email }));
    } else {
      localStorage.removeItem("connectly-profile");
      localStorage.removeItem("connectly-demo-session");
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.me()
      .then(({ user: currentUser }) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [setUser]);

  const value = useMemo(() => ({ user, setUser, loading }), [user, setUser, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



