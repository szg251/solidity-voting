import { Request, Response } from "express";
import { Address, ContractExecutionError, Web3 } from "web3";

// TODO: There's a way to infer the contract types
import voting from "../../../out/Voting.sol/Voting.json" with { type: "json" };
import broadcastLog from "../../../broadcast/Voting.s.sol/31337/run-latest.json" with {
  type: "json",
};

const votingAddress = broadcastLog.transactions[0].contractAddress;

export type AddCandidateReq = {
  address: Address;
  candidate: Candidate;
};

export type AddCandidateResp = TransactionObject | ContractExecutionError;

// All the data necessary to sign and submit a transaction from the frontend
export type TransactionObject = {
  from: Address;
  to: Address;
  data: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  chainId: string;
};

export type Candidate = {
  name: string;
  metadata: string;
};

export type CandidateWithVotes = {
  candidate: Candidate;
  voteCount: string;
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
    const feeData = await web3.eth.calculateFeeData();

    res.statusCode = 200;
    res.send({
      from: req.body.address,
      to: votingAddress,
      data: contractCall.encodeABI(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      nonce: (await web3.eth.getTransactionCount(req.body.address)).toString(),
      chainId: (await web3.eth.getChainId()).toString(),
    });
  } catch (err) {
    if (err instanceof ContractExecutionError) {
      res.statusCode = 500;
      res.send(err);
    }
    res.statusCode = 500;
    res.send();
  }
};

export type ListCandidateResp = {
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

    const response: any[] = await votingContract.methods
      .getCandidates().call();

    const candidates = response.map((item) => ({
      candidate: {
        name: item.candidate.name,
        metadata: item.candidate.metadata,
      },
      voteCount: item.voteCount.toString(),
    }));

    res.statusCode = 200;
    res.send({
      candidates: candidates.map((candidate) => ({
        candidate: candidate.candidate,
        voteCount: candidate.voteCount.toString(),
      })),
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

export type VoteReq = {
  address: Address;
  candidateId: number;
};

export type VoteResp = TransactionObject | ContractExecutionError;

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
    const feeData = await web3.eth.calculateFeeData();

    res.statusCode = 200;
    res.send({
      from: req.body.address,
      to: votingAddress,
      data: contractCall.encodeABI(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
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

export type GetWinnerResp = {
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

    const response: any = await votingContract.methods.getWinner()
      .call();

    const candidate = {
      name: response.name,
      metadata: response.metadata,
    };

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
