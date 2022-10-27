import axios from "axios";
import { useEffect } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

import type { ResoureceGroupType, StorageAccountType } from '../dataStructures'

type StateProps = {
    resourceGroup: ResoureceGroupType | undefined
    setResourceGroup(arg: ResoureceGroupType): void
    storageAccount: StorageAccountType | undefined
    setStorageAccount(arg: StorageAccountType): void
}

function State(props: StateProps) {

    useEffect(() => {
        getResourceGroup()
    }, [])

    useEffect(() => {
        getStorageAccount()
    }, [props.resourceGroup])

    function getResourceGroup() {
        axios.get("http://localhost:8080/getstaterg").then(response => {
            props.setResourceGroup(response.data)
        }).catch(error => {
            console.log("Something went wrong : ", error)
        })
    }

    function getStorageAccount() {
        axios.get("http://localhost:8080/getstatestorageaccount").then(response => {
            props.setStorageAccount(response.data)
        }).catch(error => {
            console.log("Something went wrong : ", error)
        })
    }

    function createResoureceGroup() {
        axios.get("http://localhost:8080/createstaterg").then(response => {
            props.setResourceGroup(response.data)
            createStorageAccount()
        }).catch(error => {
            console.log("Something went wrong : ", error)
        });
    }

    function createStorageAccount() {
        axios.get("http://localhost:8080/createstatestorageaccount").then(response => {
            props.setStorageAccount(response.data)
        }).catch(error => {
            console.log("Something went wrong : ", error)
        });
    }


    return (
        <>
            {!props.storageAccount?.id ?
                <OverlayTrigger
                    key='state'
                    placement='bottom'
                    overlay={
                        <Tooltip id={`tooltip-state`}>
                            <strong>Resourece Group not configured.</strong> This tool uses terraform which requires to store the state.
                            The state is stored in a storage account in a resource group named 'repro-project'.
                            Storage account can have any name, but there must only be one storage account in the resource group.
                        </Tooltip>
                    }
                >
                    <Button href="#" size='sm' variant="link" onClick={() => createResoureceGroup()} style={{ textDecoration: "none" }} className="p-0 m-0">Configure State Storage</Button>
                </OverlayTrigger>
                :
                <OverlayTrigger
                    key='state-1'
                    placement='bottom'
                    overlay={
                        <Tooltip id={`tooltip-state`}>
                            This is the name of the storage account were terraform state is stored. You will find in your subscription under <code>'repro-project'</code> resourece group. https://learn.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage?tabs=azure-cli
                        </Tooltip>
                    }
                >
                    <a>{props.storageAccount?.name}</a>
                </OverlayTrigger>
            }
        </>
    )
}

export default State