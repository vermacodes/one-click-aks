#!/bin/bash

# Loading variables to run NVM
source ~/.nvm/nvm.sh
source ~/.profile
source ~/.bashrc

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

cd app/interface 

if [[ "$1" == "" ]]; then
    sa="ashisverma"
else
    sa=$1
fi

npm run build && cd dist && az storage blob upload-batch -d '$web' --account-name ${sa} -s "." --overwrite