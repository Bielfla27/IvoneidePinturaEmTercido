package br.com.gabrielfelix.ivoneide_pintura_api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordRecoveryRequest {

	@NotBlank(message = "O e-mail e obrigatorio.")
	@Email(message = "Informe um e-mail valido.")
	private String email;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
