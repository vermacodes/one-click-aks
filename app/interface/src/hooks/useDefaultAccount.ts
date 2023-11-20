import { useMemo } from "react";
import { AccountType } from "../dataStructures";
import { useAccount } from "./useAccount";

export function useDefaultAccount() {
  const { data: accounts } = useAccount();

  function getDefaultAccount(accounts: AccountType[]): AccountType | undefined {
    var defaultAccount = accounts.find((account) => account.isDefault);
    if (defaultAccount) {
      return defaultAccount;
    } else {
      return undefined;
    }
  }

  const defaultAccount = useMemo(() => {
    if (!accounts) {
      return undefined;
    }
    return getDefaultAccount(accounts);
  }, [accounts]);

  return { defaultAccount };
}
