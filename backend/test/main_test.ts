import request from "supertest";
import { assertEquals } from "@std/assert";

const backend = request("http://localhost:8000");

const ownerPrivKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const voterPrivKey =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

Deno.test(async function fullWorkflow() {
  await addCandidate();
  console.log("Candidate added");

  await listCandidates();
  console.log("Candidates listed");

  await vote();
  console.log("Voted");

  await getWinner();
  console.log("Winner announced");
});

async function addCandidate() {
  const addCandidateResp = await backend.post("/voting/candidates")
    .send({
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      candidate: {
        name: "Gergely",
        metadata: "Vote for me!",
      },
    }).expect(200);

  const signTxResp = await backend.post("/testnet/sign").send(
    {
      testnetPrivateKey: ownerPrivKey,
      transactionObject: addCandidateResp.body,
    },
  )
    .expect(200);

  await backend.post("/testnet/submit").send(
    {
      signedTransaction: signTxResp.body,
    },
  )
    .expect(201);
}

async function listCandidates() {
  const listCandidatesResp = await backend.get("/voting/candidates").expect(
    200,
  );

  assertEquals(listCandidatesResp.body, {
    candidates: [{
      candidate: {
        name: "Gergely",
        metadata: "Vote for me!",
      },
      voteCount: "0",
    }],
  });
}

async function vote() {
  const voteResp = await backend.post("/voting/vote")
    .send({
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      candidateId: 0,
    }).expect(200);

  const signTxResp = await backend.post("/testnet/sign").send(
    {
      testnetPrivateKey: voterPrivKey,
      transactionObject: voteResp.body,
    },
  )
    .expect(200);

  await backend.post("/testnet/submit").send(
    {
      signedTransaction: signTxResp.body,
    },
  )
    .expect(201);
}

async function getWinner() {
  const getWinnerResp = await backend.get("/voting/winner").expect(
    200,
  );

  assertEquals(getWinnerResp.body, {
    candidate: {
      name: "Gergely",
      metadata: "Vote for me!",
    },
  });
}
