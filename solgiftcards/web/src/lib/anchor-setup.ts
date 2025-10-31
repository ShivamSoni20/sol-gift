import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "./idl.json";

const PROGRAM_ID = new web3.PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    return new Program(idl as any, PROGRAM_ID, provider);
  }, [connection, wallet]);

  return program;
}

export { PROGRAM_ID };
