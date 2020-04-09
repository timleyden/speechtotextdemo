#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 1.0.17
# ----------------------

# Helpers
# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}
RunNpm() {
    echo Restoring npm packages in $1

    pushd $1 > /dev/null
    eval $NPM_CMD install --production 2>&1
    exitWithMessageOnError "Npm Install Failed"
    popd > /dev/null
}

RestoreNpmPackages() {

    local lookup="package.json"
    if [ -e "$1/$lookup" ]
    then
      RunNpm $1
    fi

    for subDirectory in "$1"/*
    do
      if [ -d "$subDirectory" ] && [ -e "$subDirectory\\$lookup" ]
      then
        RunNpm $subDirectory
      fi
    done
}


DeployWithoutFuncPack() {
    echo Not using funcpack because SCM_USE_FUNCPACK is not set to 1

  # 1. Build
  nuget.exe restore "$DEPLOYMENT_SOURCE\src\speechtotextdemo.csproj" -MSBuildPath "$MSBUILD_15_DIR"
  echo "$MSBUILD_15_DIR\MSBuild.exe" "$DEPLOYMENT_SOURCE\src\speechtotextdemo.csproj" /p:DeployOnBuild=true /p:configuration=Release /p:publishurl=$DEPLOYMENT_TEMP $SCM_BUILD_ARGS
  "$MSBUILD_15_DIR\MSBuild.exe" "$DEPLOYMENT_SOURCE\src\speechtotextdemo.csproj" /p:DeployOnBuild=true /p:configuration=Release /p:publishurl=$DEPLOYMENT_TEMP $SCM_BUILD_ARGS
    # 2. KuduSync
    if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
      "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh;obj"
      exitWithMessageOnError "Kudu Sync failed"
    fi

}

# Node Helpers
# ------------

selectNodeVersion () {
  if [[ -n "$KUDU_SELECT_NODE_VERSION_CMD" ]]; then
    SELECT_NODE_VERSION="$KUDU_SELECT_NODE_VERSION_CMD \"$DEPLOYMENT_SOURCE/webapp/transcriptionviewer\" \"$DEPLOYMENT_TARGET\" \"$DEPLOYMENT_TEMP\""
    eval $SELECT_NODE_VERSION
    exitWithMessageOnError "select node version failed"

    if [[ -e "$DEPLOYMENT_TEMP/__nodeVersion.tmp" ]]; then
      NODE_EXE=`cat "$DEPLOYMENT_TEMP/__nodeVersion.tmp"`
      exitWithMessageOnError "getting node version failed"
    fi
    
    if [[ -e "$DEPLOYMENT_TEMP/__npmVersion.tmp" ]]; then
      NPM_JS_PATH=`cat "$DEPLOYMENT_TEMP/__npmVersion.tmp"`
      exitWithMessageOnError "getting npm version failed"
    fi

    if [[ ! -n "$NODE_EXE" ]]; then
      NODE_EXE=node
    fi

    NPM_CMD="\"$NODE_EXE\" \"$NPM_JS_PATH\""
  else
    NPM_CMD=npm
    NODE_EXE=node
  fi
}


# Prerequisites
# -------------
if [ "$APPSETTING_Project" == "function" ]; then
echo "starting function deployment"

##################################################################################################################################
#deploy function
#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 1.0.17
# ----------------------


# Prerequisites
# -------------

# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup
# -----

SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR="${SCRIPT_DIR%/*}"
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi

# Npm helper
# ------------

npmPath=`which npm 2> /dev/null`
if [ -z "$npmPath" ]
then
  NPM_CMD="node \"$NPM_JS_PATH\"" # on windows server there's only npm.cmd
else
  NPM_CMD=npm
fi

##################################################################################################################################
# Deployment
# ----------

echo Handling function App deployment.

DeployWithoutFuncPack
# TODO funcpack is not installed on linux machine

##################################################################################################################################
echo "Finished successfully."

else

#####################################################################################################################################
##manage node js and angular compile
# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup
# -----

SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR="${SCRIPT_DIR%/*}"
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi


##################################################################################################################################
# Deployment
# ----------

echo Handling node.js deployment.
# 2. Select node version
selectNodeVersion


# 3. Install npm packages
if [ -e "$DEPLOYMENT_SOURCE/webapp/transcriptionviewer/package.json" ]; then
  cd "$DEPLOYMENT_SOURCE/webapp/transcriptionviewer/"
  echo "Running npm install"
  #eval $NPM_CMD install --production
  eval npm install
  exitWithMessageOnError "npm failed"
  cd - > /dev/null
fi

# 3. Angular Prod Build
if [ -e "$DEPLOYMENT_SOURCE/webapp/transcriptionviewer/angular.json" ]; then
  cd "$DEPLOYMENT_SOURCE/webapp/transcriptionviewer"
  pwd
 echo "running npm run-script build"
  #eval $NPM_CMD run-script build   --production
  eval npm run-script build
  exitWithMessageOnError "Angular build failed"
  cd - > /dev/null
fi

# 1. KuduSync
if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
  "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE/webapp/transcriptionviewer" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh"
  exitWithMessageOnError "Kudu Sync failed"
fi




##################################################################################################################################
echo "Finished successfully."


fi

