package br.com.gabrielfelix.ivoneide_pintura_api.common;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductNotFoundException;

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
}
