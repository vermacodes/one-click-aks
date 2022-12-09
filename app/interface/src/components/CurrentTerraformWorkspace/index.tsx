import { useState } from "react";
import { SiTerraform } from "react-icons/si";
import { Link } from "react-router-dom";
import { useTerraformWorkspace } from "../../hooks/useTfActions";

type Props = {};

export default function index({}: Props) {
  const [menu, showMenu] = useState<boolean>(false);
  const { data } = useTerraformWorkspace();
  return (
    <div className="relative inline-block text-left">
      <Link to={"#"}>
        <button
          className="border-b-2 border-transparent py-1 hover:border-b-2 hover:border-b-sky-400 hover:text-sky-400"
          onMouseEnter={() => showMenu(true)}
          onMouseLeave={() => showMenu(false)}
        >
          {data &&
            data.map((worksapce) => (
              <>{worksapce.selected && worksapce.name}</>
            ))}
        </button>
        <div
          className={`absolute right-0 z-10 mt-1 w-36 origin-top-right rounded bg-slate-200 p-3 text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100 dark:shadow-slate-300 ${
            !menu && "hidden"
          }`}
        >
          <p>
            This is your terraform workspace. To change go to terraform
            settings.
          </p>
        </div>
      </Link>
    </div>
  );
}
