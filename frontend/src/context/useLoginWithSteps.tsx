import React from "react";

export const useLoginWithSteps = () => {
  const [loginStep, setLoginStep] = React.useState(1);
  const [usesGoogle, setUsesGoogle] = React.useState(false);
  const [usesEmailAndPassword, setUsesEmailAndPassword] = React.useState(false);
  const [usesWebAuthn, setUsesWebAuthn] = React.useState(false);

  async function loginWithSteps({
    email,
    password,
  }: {
    email: string;
    password?: string;
  }) {
    if (loginStep === 1) {
      // 1. send email to server, get back which login method the user used.
      // 2. set state accordingly for auth login process used. Login UI will use state to render elements
      // 3. Increment loginStep state
      return;
    }

    // * Step 2

    // 1. if login method is email and password, send email and password to server and use login method
  }
  return null;
};
