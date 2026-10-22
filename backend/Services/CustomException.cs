namespace backend.Services;

// we would be able to catch the exception and return 400
public class CustomException(string message) : Exception(message);
