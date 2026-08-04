package br.com.gabrielfelix.ivoneide_pintura_api.auth;

public class InvalidCredentialsException extends RuntimeException {

	public InvalidCredentialsException() {
		super("E-mail ou senha invalidos.");
	}
}
