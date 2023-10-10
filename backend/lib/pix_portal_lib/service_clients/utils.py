import os


def get_env(env_var_name: str) -> str:
    value = os.getenv(env_var_name)
    if value is None:
        raise Exception(f"Environment variable {env_var_name} is not set")
    return value
