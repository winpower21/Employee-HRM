class UserAlreadyExistsException(Exception):
    def __init__(self, message: str = "User already exists"):
        self.message = message
        super().__init__(self.message)


class DatabaseException(Exception):
    def __init__(self, message: str = "Database Error"):
        self.message = message
        super().__init__(self.message)


class NoResultFoundException(Exception):
    def __init__(self, message: str = "Query returned no results"):
        self.message = message
        super().__init__(self.message)


class NotFoundException(Exception):
    def __init__(self, message: str = "Resource Not Found"):
        self.message = message
        super().__init__(self.message)


class InvalidCredentialsException(Exception):
    def __init__(self, message: str = "Cannot verify credentials"):
        self.message = message
        super().__init__(self.message)


class DataIntegrityException(Exception):
    def __init__(self, message: str = "Data already exists"):
        self.message = message
        super().__init__(self.message)
