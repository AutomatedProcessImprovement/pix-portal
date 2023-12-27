# Ansible Scripts

## Setup

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

### Deployment

To deploy the application, run:

```shell
ansible-playbook -i ansible/hosts.yaml ansible/deploy-all.yaml
```
