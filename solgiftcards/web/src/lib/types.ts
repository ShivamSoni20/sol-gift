import { PublicKey } from "@solana/web3.js";

export type SolgiftcardsIDL = {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
  };
  version: "0.1.0";
  name: "solgiftcards";
  instructions: [
    {
      name: "mintGiftCard";
      accounts: [
        { name: "issuer"; isMut: true; isSigner: true },
        { name: "nftMint"; isMut: true; isSigner: true },
        { name: "giftCard"; isMut: true; isSigner: false },
        { name: "paymentMint"; isMut: false; isSigner: false },
        { name: "issuerTokenAccount"; isMut: true; isSigner: false },
        { name: "escrowTokenAccount"; isMut: true; isSigner: false },
        { name: "issuerNftAccount"; isMut: true; isSigner: false },
        { name: "metadata"; isMut: true; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "rent"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "amount"; type: "u64" },
        { name: "expiryTimestamp"; type: "i64" },
        { name: "merchantName"; type: "string" },
        { name: "merchantAddress"; type: "publicKey" },
        { name: "uri"; type: "string" }
      ];
    },
    {
      name: "transferGiftCard";
      accounts: [
        { name: "currentOwner"; isMut: true; isSigner: true },
        { name: "newOwner"; isMut: false; isSigner: false },
        { name: "nftMint"; isMut: false; isSigner: false },
        { name: "giftCard"; isMut: true; isSigner: false },
        { name: "currentOwnerNftAccount"; isMut: true; isSigner: false },
        { name: "newOwnerNftAccount"; isMut: true; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "redeemGiftCard";
      accounts: [
        { name: "merchant"; isMut: true; isSigner: true },
        { name: "giftCard"; isMut: true; isSigner: false },
        { name: "nftMint"; isMut: true; isSigner: false },
        { name: "merchantNftAccount"; isMut: true; isSigner: false },
        { name: "escrowTokenAccount"; isMut: true; isSigner: false },
        { name: "merchantTokenAccount"; isMut: true; isSigner: false },
        { name: "paymentMint"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "amountToRedeem"; type: { option: "u64" } }];
    }
  ];
  accounts: [
    {
      name: "GiftCard";
      type: {
        kind: "struct";
        fields: [
          { name: "issuer"; type: "publicKey" },
          { name: "currentOwner"; type: "publicKey" },
          { name: "merchant"; type: "publicKey" },
          { name: "merchantName"; type: "string" },
          { name: "amount"; type: "u64" },
          { name: "remainingBalance"; type: "u64" },
          { name: "mint"; type: "publicKey" },
          { name: "escrowAccount"; type: "publicKey" },
          { name: "createdAt"; type: "i64" },
          { name: "expiryTimestamp"; type: "i64" },
          { name: "status"; type: { defined: "GiftCardStatus" } },
          { name: "bump"; type: "u8" }
        ];
      };
    }
  ];
  types: [
    {
      name: "GiftCardStatus";
      type: {
        kind: "enum";
        variants: [
          { name: "Active" },
          { name: "Redeemed" },
          { name: "Expired" }
        ];
      };
    }
  ];
};

export interface GiftCardAccount {
  issuer: PublicKey;
  currentOwner: PublicKey;
  merchant: PublicKey;
  merchantName: string;
  amount: number;
  remainingBalance: number;
  mint: PublicKey;
  escrowAccount: PublicKey;
  createdAt: number;
  expiryTimestamp: number;
  status: { active: {} } | { redeemed: {} } | { expired: {} };
  bump: number;
}
