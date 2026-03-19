from fastapi import HTTPException


class AppException(HTTPException):
    """Base application exception."""

    def __init__(self, status_code: int, detail: str, code: str = "APP_ERROR"):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code


class NotFoundException(AppException):
    def __init__(self, resource: str, id: str | None = None):
        detail = f"{resource} with id {id} not found" if id else f"{resource} not found"
        super().__init__(status_code=404, detail=detail, code="NOT_FOUND")


class ValidationException(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail, code="VALIDATION_ERROR")


class DuplicateException(AppException):
    def __init__(self, resource: str, field: str):
        super().__init__(
            status_code=409,
            detail=f"{resource} with this {field} already exists",
            code="DUPLICATE",
        )


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=401, detail=detail, code="UNAUTHORIZED")
