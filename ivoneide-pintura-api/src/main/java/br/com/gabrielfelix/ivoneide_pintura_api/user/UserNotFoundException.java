package br.com.gabrielfelix.ivoneide_pintura_api.user;

public class UserNotFoundException extends RuntimeException {

	public UserNotFoundException(Long id) {
		super("Usuario com id " + id + " nao encontrado.");
	}
}
