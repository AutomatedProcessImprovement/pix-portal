#!/usr/bin/env bash

bash ./set-secrets-gh-repo-secrets.sh
gh workflow -R automatedprocessimprovement/pix-portal run deploy.yaml