import { Button } from "react-bootstrap";
import { useAccount, useLogin, useLoginStatus } from "../hooks/useAccount";
import { useSetLogs } from "../hooks/useLogs";

function Account() {
    const { mutate: setLogs } = useSetLogs();
    const { data: isAuth, isLoading: isLoadingLogin } = useLoginStatus();
    const { data: currAccount, isLoading: isLoadingAccount } = useAccount();
    const { refetch: login } = useLogin();

    function loginHandler() {
        setLogs({ isStreaming: true, logs: "" });
        login();
    }

    if (isLoadingLogin || isLoadingAccount) {
        return <>Loading...</>;
    }

    return (
        <>
            {isAuth ? (
                <>
                    {currAccount?.user.name} | {currAccount?.name}
                </>
            ) : (
                <Button variant="primary" onClick={loginHandler}>
                    Login
                </Button>
            )}
        </>
    );
}

export default Account;
