package br.com.gabrielfelix.ivoneide_pintura_api.user;

public class UserEmailAlreadyExistsException extends RuntimeException {

	public UserEmailAlreadyExistsException(String email) {
		super("Ja existe um usuario cadastrado com o e-mail " + email + ".");
	}
}
