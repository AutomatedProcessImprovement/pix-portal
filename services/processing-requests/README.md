# Processing Requests Service

## Development

### Adding new packages

Add to the `pyproject.toml` file and local environment:

```shell
poetry add <package>
```

Update the `requirements.txt` used for Docker and deployment:

```shell
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

### Instrumentation

https://opentelemetry.io/docs/instrumentation/python/automatic/

When running `opentelemetry-bootstrap -a install`, it installs additional packages that are not added
to `pyproject.toml` or `requirements.txt`. These packages are installed in the `site-packages` directory of the virtual
environment.

**NB:** Thus, don't forget to run `poetry export` after running `opentelemetry-bootstrap -a install` to update
the `requirements.txt` file.

**NB:** Still, these new packages aren't present in `pyproject.toml`. If you run `poetry install --sync` at one point,
you may lose these packages.