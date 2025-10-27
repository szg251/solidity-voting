import { TransactionObject } from "./voting.ts";
import {
  SignTransactionResult,
  TransactionHash,
  TransactionRevertInstructionError,
  Web3,
} from "web3";
import { Request, Response } from "express";

export type SignTransactionReq = {
  testnetPrivateKey: string;
  transactionObject: TransactionObject;
};

export type SignTransactionResp = SignTransactionResult;

// Sign a transaction
// Warning: this function should never be used with mainnet private keys
export const signTransaction = async (
  req: Request<null, SignTransactionResp, SignTransactionReq>,
  res: Response<SignTransactionResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;

    const result = await web3.eth.accounts.signTransaction(
      req.body.transactionObject,
      req.body.testnetPrivateKey,
    );

    res.statusCode = 200;
    res.send(result);
  } catch (err) {
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};

export type SubmitTransactionReq = {
  signedTransaction: SignTransactionResult;
};

export type SubmitTransactionResp =
  | TransactionResult
  | TransactionRevertInstructionErrorJson;

export type TransactionResult = {
  transactionHash: TransactionHash;
};

export type TransactionRevertInstructionErrorJson = {
  reason: string;
  name: string;
  code: number;
  message: string;
};

// Submit a signed transaction
export const submitTransaction = async (
  req: Request<null, SubmitTransactionResp, SubmitTransactionReq>,
  res: Response<SubmitTransactionResp>,
): Promise<void> => {
  try {
    const web3: Web3 = req.app.locals.web3;

    const result = await web3.eth.sendSignedTransaction(
      req.body.signedTransaction.rawTransaction,
    );

    res.statusCode = 201;
    res.send({ transactionHash: result.transactionHash.toString() });
  } catch (err) {
    if (err instanceof TransactionRevertInstructionError) {
      res.statusCode = 400;
      res.send({
        reason: err.reason,
        message: err.message,
        code: err.code,
        name: err.name,
      });
    }
    res.statusCode = 500;
    console.warn(err);
    res.send();
  }
};
