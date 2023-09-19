import "express-async-errors";
import { Router } from "express";
import { validate } from "../middleware/validationMiddleware";
import * as z from "zod";
import prisma from "../db";
import { CustomAPIError } from "../errors";
import {
  comparePasswords,
  decodeGoogleToken,
  decodeToken,
  generateToken,
  hashPassword,
} from "../middleware/authMiddleware";
import SimpleWebAuthnServer from "@simplewebauthn/server";

const userRouter = Router();

const userSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(255),
});

type UserPayload = z.infer<typeof userSchema>;

userRouter.post("/register", validate(userSchema), async (req, res) => {
  const { email, name, password } = req.body as UserPayload;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExists) throw new CustomAPIError("User already exists", 400);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: await hashPassword(password),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  console.log(user);

  return res.status(200).json({
    token: generateToken(user),
    user: {
      name: user.name,
      email: user.email,
    },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(255),
});

type LoginPayload = z.infer<typeof userSchema>;

userRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as LoginPayload;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!userExists) throw new CustomAPIError("User does not exist", 400);

  const passwordMatches = await comparePasswords(password, userExists.password);
  if (!passwordMatches) throw new CustomAPIError("Invalid credentials", 400);

  return res.status(201).json({
    token: generateToken(userExists),
    user: {
      name: userExists.name,
      email: userExists.email,
    },
  });
});

const googleSchema = z.object({
  token: z.string(),
});

type GooglePayload = z.infer<typeof googleSchema>;

userRouter.post("/google", validate(googleSchema), async (req, res) => {
  const { token } = req.body as GooglePayload;
  console.log(token);

  const data = decodeGoogleToken(token);

  console.log(data);

  const userExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  console.log(userExists);

  if (userExists) {
    return res.status(200).json({
      token: generateToken({
        id: userExists.id,
        name: userExists.name,
        email: userExists.email,
      }),
      user: {
        name: userExists.name,
        email: userExists.email,
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: "google",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return res.status(200).json({
    token: generateToken(user),
    user: {
      name: user.name,
      email: user.email,
    },
  });
});

userRouter.post("/auth/webauth-registration-options", async (req, res) => {
  const user = findUser(req.body.email);

  const options: SimpleWebAuthnServer.GenerateRegistrationOptionsOpts = {
    rpName: "Coffee Masters",
    rpID: "localhost",
    // internal id
    userID: user.email,
    // human-readable name
    userName: user.name,
    // the timeout for the request before cancelling the authentication
    timeout: 60000,
    attestationType: "none",

    /**
     * Passing in a user's list of already-registered authenticator IDs here prevents users from
     * registering the same device multiple times. The authenticator will simply throw an error in
     * the browser if it's asked to perform registration when one of these ID's already resides
     * on it.
     */
    excludeCredentials: user.devices
      ? user.devices.map((dev) => ({
          id: dev.credentialID,
          type: "public-key",
          transports: dev.transports,
        }))
      : [],

    authenticatorSelection: {
      userVerification: "required",
      residentKey: "required",
    },
    /**
     * The two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify an authenticator response.
   */
  const regOptions = SimpleWebAuthnServer.generateRegistrationOptions(options);
  user.currentChallenge = await regOptions.challenge;
  db.write();

  res.send(regOptions);
});

userRouter.post("/auth/webauth-registration-verification", async (req, res) => {
  const user = findUser(req.body.user.email);
  const data = req.body.data;

  const expectedChallenge = user.currentChallenge;

  let verification;
  try {
    const options = {
      credential: data,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true,
    };
    verification = await SimpleWebAuthnServer.verifyRegistrationResponse(
      options
    );
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.toString() });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;

    const existingDevice = user.devices
      ? user.devices.find((device) =>
          new Buffer(device.credentialID.data).equals(credentialID)
        )
      : false;

    if (!existingDevice) {
      const newDevice = {
        credentialPublicKey,
        credentialID,
        counter,
        transports: data.transports,
      };
      if (user.devices == undefined) {
        user.devices = [];
      }
      user.webauthn = true;
      user.devices.push(newDevice);
      db.write();
    }
  }

  res.send({ ok: true });
});

export default userRouter;
