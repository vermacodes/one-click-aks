#!/bin/bash

cd $ROOT_DIR/tf

workspaces=$(terraform workspace list)

IFS=$'\n'
for line in $workspaces; do
    printf '%s\n' "Line -> $line"
done