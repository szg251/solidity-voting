// @ts-types="npm:@types/express@5.0.4"

import express from "express";
import {
  addCandidate,
  getWinner,
  listCandidates,
  vote,
} from "./controllers/voting.ts";
import { Web3 } from "web3";
import { parseArgs } from "node:util";
import { signTransaction, submitTransaction } from "./controllers/testnet.ts";

const app = express();

const options = {
  rpcUrl: { type: "string", short: "u", default: "http://localhost:8545" },
} as const;

const args = parseArgs({ options });

app.locals.web3 = new Web3(args.values.rpcUrl);

app.use(express.json());

app.post("/voting/candidates", addCandidate);
app.get("/voting/candidates", listCandidates);
app.post("/voting/vote", vote);
app.get("/voting/winner", getWinner);

app.post("/testnet/sign", signTransaction);
app.post("/testnet/submit", submitTransaction);

app.listen(8000);
console.log(`Server is running on http://localhost:8000`);
