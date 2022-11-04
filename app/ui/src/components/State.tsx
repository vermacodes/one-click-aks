import axios from "axios";
import { useEffect } from "react";
import { Button, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";

import { StateConfigurationType } from '../dataStructures'

type StateProps = {
    stateStore: StateConfigurationType | undefined
    setStateStore(args: StateConfigurationType): void
}

function State({stateStore, setStateStore}: StateProps) {

    useEffect(() => {
        if (stateStore === undefined) {
            getStateStore()
        }
    }, [])

    function getStateStore() {
        axios.get("http://localhost:8080/getstate").then(response => {
            setStateStore(response.data)
        }).catch(error => {
            console.log("Something went wrong : ", error)
        })
    }

    function configureStateStore() {
        axios.get("http://localhost:8080/configurestate").then(response => {
            setStateStore(response.data)
        }).catch(error => {
            console.log("Something went wrong : ", error)
        })
    }


    return (
        <>
            {stateStore === undefined ?
                <a><Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />{' '}Checking storage...</a>
                :
                <>
                    {(stateStore?.blobContainer.name !== 'tfstate') ?
                        <OverlayTrigger
                            key='state'
                            placement='bottom'
                            overlay={
                                <Tooltip id={`tooltip-state`}>
                                    <strong>State storage not configured.</strong> This tool uses terraform which requires to store the state.
                                    The state is stored in a blob container named 'tfstate' in a storage account named randomly in a resource group named 'repro-project'.
                                    Storage account can have any name, but there must only be one storage account in the resource group.
                                </Tooltip>
                            }
                        >
                            {/* <Button href="#" size='sm' variant="secondary" onClick={() => configureStateStore()} style={{ textDecoration: "none" }} className="p-0 m-0">Configure State Storage</Button> */}
                            <Button size='sm' variant="secondary" onClick={() => configureStateStore()} >Configure Storage</Button>
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
                            <a>{stateStore.storageAccount.name} {stateStore.blobContainer.name}</a>
                        </OverlayTrigger>
                    }
                </>
            }
        </>
    )
}

export default State