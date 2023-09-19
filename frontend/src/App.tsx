import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthContextProvider } from "./context/authContext";
import { useAuthContext } from "./context/useAuthContext";
import GoogleSSO from "./context/google_sso";

function App() {
  return (
    <>
      <AuthContextProvider>
        <BrowserRouter>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthContextProvider>
    </>
  );
}

const Header = () => {
  const { isLoggedIn } = useAuthContext();
  return (
    <header>
      <h1>
        <img src="images/logo.svg" width="140" alt="Coffee Masters" />
      </h1>
      <nav>
        <Link
          className="navlink material-symbols-outlined"
          id="linkHome"
          to="/"
        >
          local_cafe
        </Link>
        {isLoggedIn && (
          <Link
            className="navlink material-symbols-outlined"
            id="linkOrder"
            to="/account"
          >
            account_box
          </Link>
        )}
      </nav>
    </header>
  );
};

function HomePage() {
  const { isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isLoggedIn) {
    // return welcome page
    return <AuthContent />;
  }
  return <Login />;
}

function AccountPage() {
  const { isLoggedIn, isLoading, account, logout } = useAuthContext();
  const navigate = useNavigate();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <section className="page" id="account">
      <h2>My Account</h2>
      <dl>
        <dt>Name</dt>
        <dd className="account_name">{account.name}</dd>
        <dt>Email</dt>
        <dd className="account_username">{account.email}</dd>
      </dl>

      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Log out
      </button>
    </section>
  );
}

function AuthContent() {
  const { account } = useAuthContext();

  return (
    <>
      <section className="page" id="home">
        <h2>welcome</h2>

        <div className="logged_in">
          <p>
            You are currently logged in as <b>{account.name}</b>
            <span className="account_name navlink"></span>.
          </p>
          <p>
            You can see details of your{" "}
            <a href="/account" className="navlink">
              Account
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  return (
    <section className="page" id="login">
      <h2>Log In</h2>
      <GoogleButton />

      <form
        id="formLogin"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = (
            document.getElementById("login_email") as HTMLInputElement
          ).value;
          const password = (
            document.getElementById("login_password") as HTMLInputElement
          ).value;
          try {
            await login({ email, password });
            navigate("/");
          } catch (e) {
            if (e instanceof Error) {
              alert(e.message);
            }
            console.log(e);
          }
        }}
      >
        <label htmlFor="login_email">email</label>
        <input
          placeholder="email"
          id="login_email"
          required
          autoComplete="username"
        />
        {/* TODO: hide this */}
        <label htmlFor="login_password">Password</label>
        <input
          type="password"
          id="login_password"
          autoComplete="current-password"
        />
        <button>Continue</button>

        <p>
          <Link to="/register" className="navlink">
            Register a new account instead
          </Link>
        </p>
      </form>
    </section>
  );
}

function GoogleButton() {
  return <GoogleSSO />;
  // return (
  //   <>
  //     <div
  //       id="g_id_onload"
  //       data-client_id="570406267217-ctndaemgnubkkh9u7k03v0q9vvkhtdf3.apps.googleusercontent.com"
  //       data-context="signin"
  //       data-ux_mode="popup"
  //       data-callback="loginFromGoogle"
  //       data-auto_select="true"
  //       data-itp_support="true"
  //       style={{
  //         height: 64,
  //       }}
  //     ></div>

  //     <div
  //       className="g_id_signin"
  //       data-type="standard"
  //       data-shape="pill"
  //       data-theme="filled_blue"
  //       data-text="continue_with"
  //       data-size="large"
  //       data-logo_alignment="left"
  //       style={{
  //         height: 64,
  //       }}
  //     ></div>
  //   </>
  // );
}

function Register() {
  const { isLoggedIn, register } = useAuthContext();
  const navigate = useNavigate();

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  return (
    <>
      <section className="page" id="register">
        <h2>Register</h2>
        <form
          id="formRegister"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = (
              document.getElementById("register_name") as HTMLInputElement
            ).value;
            const email = (
              document.getElementById("register_email") as HTMLInputElement
            ).value;
            const password = (
              document.getElementById("register_password") as HTMLInputElement
            ).value;

            try {
              await register({ name, email, password });
              navigate("/");
            } catch (e) {
              if (e instanceof Error) {
                alert(e.message);
              }
              console.log(e);
            }
          }}
        >
          <label htmlFor="register_name">name</label>
          <input
            placeholder="Your Name"
            id="register_name"
            required
            autoComplete="name"
          />
          <label htmlFor="register_email">email</label>
          <input
            placeholder="Your email"
            id="register_email"
            required
            type="email"
            autoComplete="username"
          />

          <label>Your Password</label>
          <input
            type="password"
            id="register_password"
            required
            autoComplete="new-password"
          />

          <button>Register Account</button>
        </form>
      </section>
    </>
  );
}

export default App;
