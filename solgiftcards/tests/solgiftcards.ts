import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Solgiftcards } from "../target/types/solgiftcards";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { expect } from "chai";

describe("Solana NFT Gift Card System", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solgiftcards as Program<Solgiftcards>;
  const connection = provider.connection;
  const payer = provider.wallet as anchor.Wallet;

  // Test accounts
  let paymentMint: PublicKey;
  let issuer: Keypair;
  let merchant: Keypair;
  let customer: Keypair;
  let nftMint: Keypair;
  let giftCardPda: PublicKey;
  let giftCardBump: number;

  // Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  before(async () => {
    // Initialize test accounts
    issuer = Keypair.generate();
    merchant = Keypair.generate();
    customer = Keypair.generate();

    // Airdrop SOL to test accounts
    const airdropAmount = 10 * anchor.web3.LAMPORTS_PER_SOL;
    await connection.confirmTransaction(
      await connection.requestAirdrop(issuer.publicKey, airdropAmount)
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(merchant.publicKey, airdropAmount)
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(customer.publicKey, airdropAmount)
    );

    // Create payment token mint (simulating USDC)
    paymentMint = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      6 // USDC has 6 decimals
    );

    console.log("Payment Mint (USDC):", paymentMint.toBase58());
  });

  describe("Gift Card Lifecycle", () => {
    const giftCardAmount = new BN(100_000_000); // 100 USDC (6 decimals)
    const merchantName = "Coffee Shop";
    const uri = "https://arweave.net/gift-card-metadata";
    let expiryTimestamp: BN;

    it("Mints a gift card NFT with locked USDC in escrow", async () => {
      // Create NFT mint keypair
      nftMint = Keypair.generate();

      // Calculate expiry (30 days from now)
      const now = Math.floor(Date.now() / 1000);
      expiryTimestamp = new BN(now + 30 * 24 * 60 * 60);

      // Derive gift card PDA
      [giftCardPda, giftCardBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("gift_card"), nftMint.publicKey.toBuffer()],
        program.programId
      );

      // Create and fund issuer's payment token account
      const issuerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        issuer.publicKey
      );

      // Mint payment tokens to issuer
      await mintTo(
        connection,
        payer.payer,
        paymentMint,
        issuerTokenAccount.address,
        payer.publicKey,
        1_000_000_000 // 1000 USDC
      );

      // Derive escrow token account
      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          giftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Derive issuer NFT account
      const issuerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Derive metadata account
      const metadata = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      console.log("\n=== Minting Gift Card ===");
      console.log("NFT Mint:", nftMint.publicKey.toBase58());
      console.log("Gift Card PDA:", giftCardPda.toBase58());
      console.log("Merchant:", merchant.publicKey.toBase58());

      // Mint gift card
      const tx = await program.methods
        .mintGiftCard(
          giftCardAmount,
          expiryTimestamp,
          merchantName,
          merchant.publicKey,
          uri
        )
        .accounts({
          issuer: issuer.publicKey,
          nftMint: nftMint.publicKey,
          giftCard: giftCardPda,
          paymentMint: paymentMint,
          issuerTokenAccount: issuerTokenAccount.address,
          escrowTokenAccount: escrowTokenAccount,
          issuerNftAccount: issuerNftAccount,
          metadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([issuer, nftMint])
        .rpc();

      console.log("Mint transaction:", tx);

      // Verify gift card state
      const giftCard = await program.account.giftCard.fetch(giftCardPda);
      expect(giftCard.issuer.toBase58()).to.equal(issuer.publicKey.toBase58());
      expect(giftCard.currentOwner.toBase58()).to.equal(issuer.publicKey.toBase58());
      expect(giftCard.merchant.toBase58()).to.equal(merchant.publicKey.toBase58());
      expect(giftCard.merchantName).to.equal(merchantName);
      expect(giftCard.amount.toString()).to.equal(giftCardAmount.toString());
      expect(giftCard.remainingBalance.toString()).to.equal(giftCardAmount.toString());
      expect(giftCard.status).to.deep.equal({ active: {} });

      console.log("✓ Gift card minted successfully");
      console.log("  Amount:", giftCard.amount.toString());
      console.log("  Merchant:", giftCard.merchantName);
    });

    it("Queries gift card status", async () => {
      console.log("\n=== Querying Gift Card Status ===");

      await program.methods
        .getGiftCardStatus()
        .accounts({
          giftCard: giftCardPda,
        })
        .rpc();

      console.log("✓ Status query successful");
    });

    it("Transfers gift card to customer", async () => {
      console.log("\n=== Transferring Gift Card ===");

      // Derive token accounts
      const issuerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const customerNftAccount = PublicKey.findProgramAddressSync(
        [
          customer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Transfer to customer
      const tx = await program.methods
        .transferGiftCard()
        .accounts({
          currentOwner: issuer.publicKey,
          newOwner: customer.publicKey,
          giftCard: giftCardPda,
          currentOwnerNftAccount: issuerNftAccount,
          newOwnerNftAccount: customerNftAccount,
          nftMint: nftMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([issuer])
        .rpc();

      console.log("Transfer transaction:", tx);

      // Verify ownership changed
      const giftCard = await program.account.giftCard.fetch(giftCardPda);
      expect(giftCard.currentOwner.toBase58()).to.equal(customer.publicKey.toBase58());

      console.log("✓ Gift card transferred to customer");
    });

    it("Customer transfers gift card to merchant", async () => {
      console.log("\n=== Customer Transfers to Merchant ===");

      const customerNftAccount = PublicKey.findProgramAddressSync(
        [
          customer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const merchantNftAccount = PublicKey.findProgramAddressSync(
        [
          merchant.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const tx = await program.methods
        .transferGiftCard()
        .accounts({
          currentOwner: customer.publicKey,
          newOwner: merchant.publicKey,
          giftCard: giftCardPda,
          currentOwnerNftAccount: customerNftAccount,
          newOwnerNftAccount: merchantNftAccount,
          nftMint: nftMint.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([customer])
        .rpc();

      console.log("Transfer transaction:", tx);

      const giftCard = await program.account.giftCard.fetch(giftCardPda);
      expect(giftCard.currentOwner.toBase58()).to.equal(merchant.publicKey.toBase58());

      console.log("✓ Gift card transferred to merchant");
    });

    it("Merchant redeems gift card and NFT is burned", async () => {
      console.log("\n=== Redeeming Gift Card ===");

      // Create merchant's payment token account
      const merchantTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        merchant.publicKey
      );

      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          giftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const merchantNftAccount = PublicKey.findProgramAddressSync(
        [
          merchant.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Get merchant balance before redemption
      const balanceBefore = (
        await connection.getTokenAccountBalance(merchantTokenAccount.address)
      ).value.amount;

      console.log("Merchant balance before:", balanceBefore);

      // Redeem full amount
      const tx = await program.methods
        .redeemGiftCard(null) // null means redeem full amount
        .accounts({
          merchant: merchant.publicKey,
          giftCard: giftCardPda,
          nftMint: nftMint.publicKey,
          merchantNftAccount: merchantNftAccount,
          escrowTokenAccount: escrowTokenAccount,
          merchantTokenAccount: merchantTokenAccount.address,
          paymentMint: paymentMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([merchant])
        .rpc();

      console.log("Redeem transaction:", tx);

      // Verify merchant received funds
      const balanceAfter = (
        await connection.getTokenAccountBalance(merchantTokenAccount.address)
      ).value.amount;

      console.log("Merchant balance after:", balanceAfter);
      expect(BigInt(balanceAfter) - BigInt(balanceBefore)).to.equal(
        BigInt(giftCardAmount.toString())
      );

      // Verify gift card is redeemed
      const giftCard = await program.account.giftCard.fetch(giftCardPda);
      expect(giftCard.remainingBalance.toString()).to.equal("0");
      expect(giftCard.status).to.deep.equal({ redeemed: {} });

      console.log("✓ Gift card redeemed successfully");
      console.log("  Merchant received:", giftCardAmount.toString(), "tokens");
    });
  });

  describe("Expired Gift Card Workflow", () => {
    let expiredNftMint: Keypair;
    let expiredGiftCardPda: PublicKey;
    const expiredAmount = new BN(50_000_000); // 50 USDC

    it("Mints a gift card that will expire", async () => {
      console.log("\n=== Minting Expiring Gift Card ===");

      expiredNftMint = Keypair.generate();

      // Set expiry to 1 second in the past (for testing)
      const now = Math.floor(Date.now() / 1000);
      const expiryTimestamp = new BN(now - 1);

      [expiredGiftCardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("gift_card"), expiredNftMint.publicKey.toBuffer()],
        program.programId
      );

      const issuerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        issuer.publicKey
      );

      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          expiredGiftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const issuerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          expiredNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const metadata = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          expiredNftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      await program.methods
        .mintGiftCard(
          expiredAmount,
          expiryTimestamp,
          "Expired Shop",
          merchant.publicKey,
          "https://arweave.net/expired"
        )
        .accounts({
          issuer: issuer.publicKey,
          nftMint: expiredNftMint.publicKey,
          giftCard: expiredGiftCardPda,
          paymentMint: paymentMint,
          issuerTokenAccount: issuerTokenAccount.address,
          escrowTokenAccount: escrowTokenAccount,
          issuerNftAccount: issuerNftAccount,
          metadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([issuer, expiredNftMint])
        .rpc();

      console.log("✓ Expired gift card minted");
    });

    it("Burns expired gift card and reclaims funds to issuer", async () => {
      console.log("\n=== Burning Expired Gift Card ===");

      const issuerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        issuer.publicKey
      );

      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          expiredGiftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const ownerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          expiredNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Get issuer balance before
      const balanceBefore = (
        await connection.getTokenAccountBalance(issuerTokenAccount.address)
      ).value.amount;

      const tx = await program.methods
        .burnExpiredGiftCard()
        .accounts({
          currentOwner: issuer.publicKey,
          giftCard: expiredGiftCardPda,
          nftMint: expiredNftMint.publicKey,
          ownerNftAccount: ownerNftAccount,
          escrowTokenAccount: escrowTokenAccount,
          issuerTokenAccount: issuerTokenAccount.address,
          issuer: issuer.publicKey,
          paymentMint: paymentMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([issuer])
        .rpc();

      console.log("Burn transaction:", tx);

      // Verify issuer received refund
      const balanceAfter = (
        await connection.getTokenAccountBalance(issuerTokenAccount.address)
      ).value.amount;

      expect(BigInt(balanceAfter) - BigInt(balanceBefore)).to.equal(
        BigInt(expiredAmount.toString())
      );

      // Verify gift card is expired
      const giftCard = await program.account.giftCard.fetch(expiredGiftCardPda);
      expect(giftCard.remainingBalance.toString()).to.equal("0");
      expect(giftCard.status).to.deep.equal({ expired: {} });

      console.log("✓ Expired gift card burned and funds reclaimed");
      console.log("  Issuer reclaimed:", expiredAmount.toString(), "tokens");
    });
  });

  describe("Security Tests", () => {
    it("Prevents non-owner from transferring gift card", async () => {
      const testNftMint = Keypair.generate();
      const [testGiftCardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("gift_card"), testNftMint.publicKey.toBuffer()],
        program.programId
      );

      // Mint a test gift card
      const issuerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        issuer.publicKey
      );

      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          testGiftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const issuerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const metadata = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      const now = Math.floor(Date.now() / 1000);
      await program.methods
        .mintGiftCard(
          new BN(10_000_000),
          new BN(now + 86400),
          "Test Shop",
          merchant.publicKey,
          "https://test.com"
        )
        .accounts({
          issuer: issuer.publicKey,
          nftMint: testNftMint.publicKey,
          giftCard: testGiftCardPda,
          paymentMint: paymentMint,
          issuerTokenAccount: issuerTokenAccount.address,
          escrowTokenAccount: escrowTokenAccount,
          issuerNftAccount: issuerNftAccount,
          metadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([issuer, testNftMint])
        .rpc();

      // Try to transfer with wrong owner
      const customerNftAccount = PublicKey.findProgramAddressSync(
        [
          customer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      try {
        await program.methods
          .transferGiftCard()
          .accounts({
            currentOwner: customer.publicKey, // Wrong owner!
            newOwner: merchant.publicKey,
            giftCard: testGiftCardPda,
            currentOwnerNftAccount: issuerNftAccount,
            newOwnerNftAccount: customerNftAccount,
            nftMint: testNftMint.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([customer])
          .rpc();

        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("NotCurrentOwner");
        console.log("✓ Correctly prevented unauthorized transfer");
      }
    });

    it("Prevents redeeming gift card not owned by merchant", async () => {
      const testNftMint = Keypair.generate();
      const [testGiftCardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("gift_card"), testNftMint.publicKey.toBuffer()],
        program.programId
      );

      // Mint a test gift card
      const issuerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        issuer.publicKey
      );

      const escrowTokenAccount = PublicKey.findProgramAddressSync(
        [
          testGiftCardPda.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          paymentMint.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const issuerNftAccount = PublicKey.findProgramAddressSync(
        [
          issuer.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      const metadata = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0];

      const now = Math.floor(Date.now() / 1000);
      await program.methods
        .mintGiftCard(
          new BN(10_000_000),
          new BN(now + 86400),
          "Test Shop 2",
          merchant.publicKey,
          "https://test2.com"
        )
        .accounts({
          issuer: issuer.publicKey,
          nftMint: testNftMint.publicKey,
          giftCard: testGiftCardPda,
          paymentMint: paymentMint,
          issuerTokenAccount: issuerTokenAccount.address,
          escrowTokenAccount: escrowTokenAccount,
          issuerNftAccount: issuerNftAccount,
          metadata: metadata,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([issuer, testNftMint])
        .rpc();

      // Try to redeem while issuer still owns it
      const merchantTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer.payer,
        paymentMint,
        merchant.publicKey
      );

      const merchantNftAccount = PublicKey.findProgramAddressSync(
        [
          merchant.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          testNftMint.publicKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      try {
        await program.methods
          .redeemGiftCard(null)
          .accounts({
            merchant: merchant.publicKey,
            giftCard: testGiftCardPda,
            nftMint: testNftMint.publicKey,
            merchantNftAccount: merchantNftAccount,
            escrowTokenAccount: escrowTokenAccount,
            merchantTokenAccount: merchantTokenAccount.address,
            paymentMint: paymentMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([merchant])
          .rpc();

        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.toString()).to.include("NotOwnedByMerchant");
        console.log("✓ Correctly prevented unauthorized redemption");
      }
    });
  });
});
