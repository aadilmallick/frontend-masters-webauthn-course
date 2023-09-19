import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface IAuthContext {
  isLoggedIn: boolean;
  account: {
    email: string;
    name: string;
  };
  register: (account: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  login: (account: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  loginWithGoogle: (account: {
    email: string;
    name: string;
    token: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export type Response = {
  token: string;
  user: {
    name: string;
    email: string;
  };
};

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<IAuthContext["account"]>({
    email: "",
    name: "",
  });
  const [tokenS, setTokens] = useState(localStorage.getItem("token"));

  //   useEffect(() => {

  //   }, [tokenS])

  // when loading app, first check if we have a user or token in local storage
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // if token is in local storage, we are logged in and set user state to logged in
    if (token && user) {
      const data = JSON.parse(user) as IAuthContext["account"];
      setAccount(data);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  async function register({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) {
    setIsLoading(true);
    // 1. request server to register user in endpoint, pass credentials data
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { message: string };
      setIsLoading(false);
      throw new Error(data.message);
    }
    // 2. get response from server
    const data = (await res.json()) as Response;

    // 3. save token in local storage
    localStorage.setItem("token", data.token);

    // 4. save user in local storage
    localStorage.setItem("user", JSON.stringify(data.user));

    setAccount(data.user);
    setIsLoggedIn(true);

    setIsLoading(false);
  }

  async function login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    setIsLoading(true);

    // 1. request server to register user in endpoint, pass credentials data
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { message: string };
      setIsLoading(false);
      throw new Error(data.message);
    }

    // 2. get response from server
    const data = (await res.json()) as Response;

    // 3. save token in local storage
    localStorage.setItem("token", data.token);

    // 4. save user in local storage
    localStorage.setItem("user", JSON.stringify(data.user));

    // const credentials = await navigator.credentials.

    setAccount(data.user);
    setIsLoggedIn(true);

    setIsLoading(false);
  }

  async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  }

  async function loginWithGoogle({
    email,
    name,
    token,
  }: {
    email: string;
    name: string;
    token: string;
  }) {
    setAccount({
      email,
      name,
    });
    setIsLoggedIn(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ email, name }));
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        account,
        register,
        login,
        logout,
        isLoading,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
