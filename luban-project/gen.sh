#!/bin/bash

WORKSPACE=.
LUBAN_DLL=$WORKSPACE/../../Luban/Luban.dll

dotnet $LUBAN_DLL \
    -t all \
    -c cs-simple-json \
    -d json \
    --conf $WORKSPACE/luban.conf \
    -x outputCodeDir=$WORKSPACE/Output/Scripts \
    -x outputDataDir=$WORKSPACE/Output/Tables