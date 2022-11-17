import axios from "axios";
import { useQuery } from "react-query";

function getSharedTemplates() {
    return axios.get(`http://localhost:8080/sharedtemplates`);
}

export function useSharedTemplates() {
    return useQuery("shared-templates", getSharedTemplates, {
        select: (data) => {
            return data.data.blob;
        },
    });
}

function getSharedLabs() {
    return axios.get(`http://localhost:8080/listlabs`);
}

export function useSharedLabs() {
    return useQuery("shared-labs", getSharedLabs, {
        select: (data) => {
            return data.data.blob;
        },
    });
}
