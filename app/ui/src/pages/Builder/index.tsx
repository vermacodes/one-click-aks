import Terminal from "../../components/Terminal";
import Tfvar from "../../components/Tfvar";

export default function Builder() {
    return (
        <div className="my-3 mx-20 mb-2">
            <Tfvar />
            <Terminal />
        </div>
    );
}
