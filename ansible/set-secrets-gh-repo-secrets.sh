#!/usr/bin/env bash

# Converts the "secrets" directory into a bytestring,
# then, sets it as a repository secret in GithubActions using `gh` CLI, https://cli.github.com/
tar -czv secrets | base64 | gh secret -R AutomatedProcessImprovement/pix-portal set SECRETS_TAR_GZ_B64