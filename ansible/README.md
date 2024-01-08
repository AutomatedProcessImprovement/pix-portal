# Automated Configuration and Deployment

For automation, we use Ansible (and GitHub Actions). With these Ansible scripts, you can:

- configure machines in ETAIS (machines must be already provisioned)
  - format a file system
  - mount an additional disk
  - set up Docker
- deploy to production (GitHub Actions is configured to launch this)

## Configuring

Start with configuring machines by running:

```shell
ansible-playbook -i ansible/hosts.yaml ansible/setup-disks.yaml
ansible-playbook -i ansible/hosts.yaml ansible/setup-docker.yaml
```

You can test the installation by running nginx and exposing it on port 80:

```shell
ansible-playbook -i ansible/hosts.yaml ansible/test-docker.yaml
```

Then, you can access the default nginx page at [https://pix.cloud.ut.ee](https://pix.cloud.ut.ee).

Stop the nginx container by running:

```shell
ansible-playbook -i ansible/hosts.yaml ansible/test-docker-stop.yaml
```

## Deploying

(Optional) Pack secrets and set as a repository secret in GitHub ([GH CLI](https://cli.github.com/) needs to be installed and authorized):

```shell
./set-secrets-gh-repo-secrets.sh
```

To deploy the application, run:

```shell
ansible-playbook -i ansible/hosts.yaml ansible/deploy.yaml
```
