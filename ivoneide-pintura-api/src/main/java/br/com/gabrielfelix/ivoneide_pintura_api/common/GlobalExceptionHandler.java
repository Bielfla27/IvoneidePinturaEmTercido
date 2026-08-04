package br.com.gabrielfelix.ivoneide_pintura_api.common;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import br.com.gabrielfelix.ivoneide_pintura_api.auth.InvalidCredentialsException;
import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductNotFoundException;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserEmailAlreadyExistsException;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
		List<String> errors = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.toList();

		ApiError apiError = new ApiError(
				HttpStatus.BAD_REQUEST.value(),
				"Existem campos inválidos na requisição.",
				errors);

		return ResponseEntity.badRequest().body(apiError);
	}

	@ExceptionHandler(ProductNotFoundException.class)
	public ResponseEntity<ApiError> handleProductNotFound(ProductNotFoundException exception) {
		ApiError apiError = new ApiError(
				HttpStatus.NOT_FOUND.value(),
				exception.getMessage(),
				List.of(exception.getMessage()));

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<ApiError> handleUserNotFound(UserNotFoundException exception) {
		ApiError apiError = new ApiError(
				HttpStatus.NOT_FOUND.value(),
				exception.getMessage(),
				List.of(exception.getMessage()));

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiError);
	}

	@ExceptionHandler(UserEmailAlreadyExistsException.class)
	public ResponseEntity<ApiError> handleUserEmailAlreadyExists(UserEmailAlreadyExistsException exception) {
		ApiError apiError = new ApiError(
				HttpStatus.CONFLICT.value(),
				exception.getMessage(),
				List.of(exception.getMessage()));

		return ResponseEntity.status(HttpStatus.CONFLICT).body(apiError);
	}

	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException exception) {
		ApiError apiError = new ApiError(
				HttpStatus.UNAUTHORIZED.value(),
				exception.getMessage(),
				List.of(exception.getMessage()));

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiError);
	}
}
