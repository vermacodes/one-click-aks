import { useEffect, useRef } from "react";
import StartCommand from "../../components/LandingPageComponents/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function Landing() {
  const optionsRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    document.title = "ACT Labs | Home";
  }, []);

  return (
    <PageLayout heading="">
      {/* <div className="fixed inset-0 min-h-screen bg-slate-100 dark:bg-slate-900 ">
        <div className="h-full items-center justify-center overflow-auto p-10"> */}
      <div className="flex flex-col gap-20 py-4">
        <div className="flex items-center justify-center">
          <div className="relative w-full">
            <div className="absolute -top-48 left-24 h-[70vh] w-[70vh] animate-blob rounded-full bg-purple-600 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>
            <div className="animation-delay-2000 absolute top-48 left-24 h-[70vh] w-[70vh] animate-blob rounded-full bg-emerald-600 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>
            <div className="animation-delay-4000 absolute top-24 right-24 h-[70vh] w-[70vh] animate-blob rounded-full bg-sky-600 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>
            <div className="animation-delay-2000 absolute -top-48 right-24 h-[70vh] w-[70vh] animate-blob rounded-full bg-yellow-600 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>

            {/* <div className="absolute -top-12 left-1/4 h-96 w-96 animate-blob rounded-full bg-purple-500 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>
              <div className="animation-delay-2000 absolute top-48 left-1/4 h-96 w-96 animate-blob rounded-full bg-green-500 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div>
              <div className="animation-delay-4000 absolute left-1/3 top-24 h-96 w-96 animate-blob rounded-full bg-blue-500 opacity-30 mix-blend-multiply blur-xl filter dark:mix-blend-color"></div> */}
            <div className="relative mx-8">
              <div className="flex flex-col gap-20">
                <h1 className="text text-9xl">Head start your lab repros</h1>
                <p className="text-4xl text-slate-500">
                  Build and deploy labs in minutes ⌚ get a head start with labs
                  built and tested by AKS Ninjas 🥷
                </p>
                {/* <button
                  className="flex animate-bounce justify-center text-2xl hover:text-purple-500"
                  onClick={() =>
                    optionsRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  ↓
                </button> */}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-slate-100" ref={optionsRef}>
          <div className="flex flex-col justify-between gap-10 rounded bg-fuchsia-600 bg-gradient-to-r from-blue-600 to-purple-600 p-4 dark:bg-fuchsia-600">
            <div className="flex flex-col gap-6">
              <h4 className="text-xl">Setup Server</h4>
              <h1 className="text-3xl">🚀 Deploy Server on Docker or Azure</h1>
              <p className="text-lg">
                Server needs access to your subscription. If we host the server
                for you, we need access to your subscription. We are not ready
                for that. So, you need to host the server.{" "}
              </p>
            </div>
            <div>
              <a
                href="https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/849282/Getting-Started"
                target={"_blank"}
                className="w-fit whitespace-nowrap rounded-full bg-slate-200 py-2 px-8 text-2xl text-blue-700 hover:bg-slate-300"
              >
                Get Started
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-10 rounded bg-gradient-to-r from-sky-600 to-emerald-600 p-4 dark:bg-fuchsia-600">
            <div className="flex flex-col gap-6">
              <h4 className="text-xl">Public Labs</h4>
              <h1 className="text-3xl">
                🏃 Start with public labs created by Ninjas
              </h1>
              <p className="text-lg">
                There are many labs built by AKS SMEs which cover common
                scenarios and emerging issues. You can use them as is or modify
                to match your requirements.
              </p>
            </div>
            <div>
              <a
                href="publiclabs"
                className="w-fit whitespace-nowrap rounded-full bg-slate-200 py-2 px-8 text-2xl text-blue-700 hover:bg-slate-300"
              >
                Check Out
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-10 rounded bg-gradient-to-r from-rose-500 to-pink-600 p-4 dark:bg-fuchsia-600">
            <div className="flex flex-col gap-6">
              <h4 className="text-xl">Build Your Own</h4>
              <h1 className="text-3xl">⚒️ Build your own Awesome Labs</h1>
              <p className="text-lg">
                None of the public labs work? You are quite unique. Build your
                own lab using builder and make it powerful by writing an
                extension script.
              </p>
            </div>
            <div>
              <a
                href="builder"
                className="w-fit whitespace-nowrap rounded-full bg-slate-200 py-2 px-8 text-2xl text-blue-700 hover:bg-slate-300"
              >
                Get to Work
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl">
            Already setup? Here is the command to quick start or upgrade server
            →
          </h1>
          <div className="flex flex-col gap-4 rounded bg-gradient-to-r from-blue-600 to-purple-600 p-4 pb-10">
            <h2 className="text-2xl">Docker</h2>
            <StartCommand />
          </div>
        </div>
      </div>
      {/* <div className="flex h-screen min-w-full flex-col gap-4">
          <h1 className="text-3xl">
            Checkout out video about getting started →
          </h1>
          <iframe
            className="h-full min-w-full"
            src="https://microsoft-my.sharepoint.com/personal/ashisverma_microsoft_com/_layouts/15/embed.aspx?UniqueId=c9027db6-c445-4e18-aad7-2486dfe87147&embed=%7B%22af%22%3Atrue%2C%22hvm%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
            allowFullScreen
            title="02 - ACT Labs - Run Server and Login.mp4"
          ></iframe>
        </div> */}
    </PageLayout>
  );
}
