from fastapi import HTTPException


class ProcessingRequestNotFoundHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Processing request not found")


class NotEnoughPermissionsHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=403, detail="Not enough permissions")


class ProjectNotFoundHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Project not found")


class UserNotFoundHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="User not found")


class AssetNotFoundHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=404, detail="Asset not found")


class AssetDoesNotBelongToProjectHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Asset does not belong to the project")


class AssetAlreadyExistsHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Asset already exists in the processing request")


class AssetAlreadyInInputAssetsHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Asset already in input assets")


class AssetAlreadyInOutputAssetsHTTP(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Asset already in output assets")


class InvalidAuthorizationHeader(HTTPException):
    def __init__(self) -> None:
        super().__init__(status_code=400, detail="Invalid authorization header")
