import { useState } from "react";
import { MdOutlineContentCopy, MdDoneOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import StartCommand from "../../components/StartCommand";
import PageLayout from "../../layouts/PageLayout";

export default function Landing() {
  return (
    <PageLayout>
      <h1 className="py-10 text-8xl font-bold">Head start your lab repros.</h1>
      <p className="pb-20 text-3xl text-slate-500">
        All you need to do is install docker 🐋, run server locally on your
        computer 💻 and configure a storage account 💾 in your Azure
        subscription. To begin, hit 'Get started' button below 👇.
      </p>
      <div className="flex gap-x-10">
        {/* <Link to={"/start"}>
          <button className="rounded-full border-2 border-transparent bg-sky-500 py-2 px-10 text-white hover:border-2 hover:border-sky-500 hover:bg-inherit hover:text-sky-500 md:text-base xl:text-2xl">
            Get Started
          </button>
        </Link> */}
        <StartCommand />
      </div>
    </PageLayout>
  );
}
