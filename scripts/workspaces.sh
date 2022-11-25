#!/bin/bash

# This scripts output is fed as is to the go code.
# This must not print anything but the output its intended to print.

OPTION=$1
WORKSPACE=$2

function listWorkspaces() {

    cd ${ROOT_DIR}/tf    
    workspaces=$(terraform workspace list)
    IFS=$'\n'
    list=""
    for line in $workspaces; do
        #line=${line/*\* /} # Removes the * from selected workspace.
        #line=${line/*\ /} # Removes leading spaces.
        line=$(echo ${line} | tr -s ' ')
        if [[ "${list}" == "" ]]; then
            list="${line}"
        else 
            list="${list},${line}"
        fi
    done
    cd ${ROOT_DIR}
    printf ${list}
}

function selectWorkspace() {
    cd ${ROOT_DIR}/tf    
    terraform workspace select $WORKSPACE
}

function createWorkspace() {
    cd ${ROOT_DIR}/tf    
    terraform workspace create $WORKSPACE    
}


# Script starts here.
cd ${ROOT_DIR}

if [[ "$OPTION" == "list" ]]; then
    listWorkspaces
    exit 0
fi

cd ${ROOT_DIR}/tf
terraform workspace $OPTION $WORKSPACE