import { useRef, useEffect } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import { Response } from "./authContext";
declare const google: any;

interface ReturnedCredentials {
  clientId: string;
  client_id: string;
  credential: string;
}

const GoogleSSO = () => {
  const g_sso = useRef(null);
  const { isLoading, isLoggedIn, loginWithGoogle } = useAuthContext();
  const navigate = useNavigate();

  async function loginFromGoogle(data: ReturnedCredentials) {
    // 1. get jwt
    const token = data.credential;
    // 2. send jwt to server, which will decode token, login or register us, and return user info with token
    const res = await fetch("http://localhost:3000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const responseData = (await res.json()) as Response;

    console.log(responseData);
    // 3. Login by setting user data and token in local storage
    await loginWithGoogle({
      email: responseData.user.email,
      name: responseData.user.name,
      token: responseData.token,
    });
    navigate("/");
  }

  useEffect(() => {
    if (g_sso.current) {
      google.accounts.id.initialize({
        client_id:
          "570406267217-ctndaemgnubkkh9u7k03v0q9vvkhtdf3.apps.googleusercontent.com",
        callback: loginFromGoogle,
      });
      google.accounts.id.renderButton(g_sso.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "220",
      });
    }
  }, [g_sso.current]);

  return <div ref={g_sso} />;
};

export default GoogleSSO;
