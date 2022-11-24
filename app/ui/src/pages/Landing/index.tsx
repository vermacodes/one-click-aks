import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";

export default function Landing() {
    const [copy, setCopy] = useState<boolean>(false);
    const dockerCommand = "docker run -d -it -p 8080:8080 ashishvermapu/repro";

    function handleCommandCopy() {
        navigator.clipboard.writeText(dockerCommand);
        setCopy(true);
        setTimeout(() => {
            setCopy(false);
        }, 3000);
    }
    return (
        <div className="my-4 mt-5 px-20 space-y-10">
            <h1 className="text-8xl py-10 font-bold">Head start your lab repros.</h1>
            <p className="text-3xl text-slate-500">
                All you need to do is install docker and run our server locally on your machine or run it in cloud and
                configure endpoint.
            </p>
            <div className="flex space-x-10">
                <button className="text-2xl border-2 border-transparent hover:border-2 text-white bg-sky-500 hover:bg-inherit hover:border-sky-500 hover:text-sky-500 rounded-full py-2 px-10">
                    Learn More
                </button>
                <div
                    className={`flex border-2  rounded-xl py-2 px-6 bg-slate-300 dark:bg-slate-700 justify-between space-x-5 ${
                        copy
                            ? "border-green-500 bg-green-200 dark:bg-green-700"
                            : "border-slate-700 dark:border-slate-200"
                    }`}
                >
                    <h3 className="font-mono text-xl">$ {dockerCommand}</h3>
                    <button className="text-2xl" onClick={() => handleCommandCopy()}>
                        {copy ? <MdDoneOutline /> : <MdOutlineContentCopy className="hover:text-sky-500" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
