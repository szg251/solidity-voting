import { Request, Response } from "express";
import { Address, ContractExecutionError, Web3 } from "web3";

// TODO: There's a way to infer the contract types
import voting from "../../../out/Voting.sol/Voting.json" with { type: "json" };

// Voting address is hard coded based on the first deployment of the contract with the
// first private key of anvil
const votingAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

type AddCandidateReq = {
  address: Address;
  candidate: Candidate;
};

type AddCandidateResp = TransactionObject | ContractExecutionError;

// All the data necessary to sign and submit a transaction from the frontend
type TransactionObject = {
  from: Address;
  to: Address;
  data: string;
  estimatedGas: string;
  gasPrice: string;
  nonce: string;
  chainId: string;
};

type Candidate = {
  name: string;
  metadata: string;
};

type CandidateWithVotes = {
  candidate: Candidate;
  votes: number;
};

// Add a candidate
// This transactions only returns a transaction object, signing and submitting should
// happen in the end-user's wallet
export const addCandidate = async (
  req: Request<null, AddCandidateResp, AddCandidateReq>,
  res: Response<AddCandidateResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;
    const votingContract = new web3.eth.Contract(
      voting.abi,
      votingAddress,
      web3,
    );

    const contractCall = votingContract.methods.addCandidate(
      req.body.candidate,
    );

    res.statusCode = 201;
    res.send({
      from: req.body.address,
      to: votingAddress,
      data: contractCall.encodeABI(),
      estimatedGas: (await contractCall.estimateGas()).toString(),
      gasPrice: (await web3.eth.getGasPrice()).toString(),
      nonce: (await web3.eth.getTransactionCount(req.body.address)).toString(),
      chainId: (await web3.eth.getChainId()).toString(),
    });
  } catch (err) {
    if (err instanceof ContractExecutionError) {
      res.statusCode = 500;
      res.send(err);
    }
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};

type ListCandidateResp = {
  candidates: CandidateWithVotes[];
} | ContractExecutionError;

// List all candidates and their vote counts
export const listCandidates = async (
  req: Request,
  res: Response<ListCandidateResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;
    const votingContract = new web3.eth.Contract(
      voting.abi,
      votingAddress,
      web3,
    );

    const candidates: CandidateWithVotes[] = await votingContract.methods
      .getCandidates().call();

    res.statusCode = 200;
    res.send({ candidates });
  } catch (err) {
    if (err instanceof ContractExecutionError) {
      res.statusCode = 500;
      res.send(err);
    }
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};

type VoteReq = {
  address: Address;
  candidateId: number;
};

type VoteResp = TransactionObject | ContractExecutionError;

// Cast a vote for a candidate
// This transactions only returns a transaction object, signing and submitting should
// happen in the end-user's wallet
export const vote = async (
  req: Request<null, VoteResp, VoteReq>,
  res: Response<VoteResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;
    const votingContract = new web3.eth.Contract(
      voting.abi,
      votingAddress,
      web3,
    );

    const contractCall = votingContract.methods.vote(
      req.body.candidateId,
    );

    res.statusCode = 200;
    res.send({
      from: req.body.address,
      to: votingAddress,
      data: contractCall.encodeABI(),
      estimatedGas: (await contractCall.estimateGas()).toString(),
      gasPrice: (await web3.eth.getGasPrice()).toString(),
      nonce: (await web3.eth.getTransactionCount(req.body.address)).toString(),
      chainId: (await web3.eth.getChainId()).toString(),
    });
  } catch (err) {
    if (err instanceof ContractExecutionError) {
      res.statusCode = 500;
      res.send(err);
    }
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};

type GetWinnerResp = {
  candidate: Candidate;
} | ContractExecutionError;

// Return the winner's name
export const getWinner = async (
  req: Request,
  res: Response<GetWinnerResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;
    const votingContract = new web3.eth.Contract(
      voting.abi,
      votingAddress,
      web3,
    );

    const candidate: Candidate = await votingContract.methods.getWinner()
      .call();

    res.statusCode = 200;
    res.send({ candidate });
  } catch (err) {
    if (err instanceof ContractExecutionError) {
      res.statusCode = 500;
      res.send(err);
    }
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};
