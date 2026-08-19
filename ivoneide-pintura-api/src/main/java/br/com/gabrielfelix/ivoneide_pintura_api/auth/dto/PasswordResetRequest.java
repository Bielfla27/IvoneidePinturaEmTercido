package br.com.gabrielfelix.ivoneide_pintura_api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordResetRequest {

	@NotBlank(message = "O e-mail e obrigatorio.")
	@Email(message = "Informe um e-mail valido.")
	private String email;

	@NotBlank(message = "O codigo de recuperacao e obrigatorio.")
	private String codigo;

	@NotBlank(message = "A nova senha e obrigatoria.")
	@Size(min = 8, message = "A nova senha deve ter no minimo 8 caracteres.")
	private String novaSenha;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public String getNovaSenha() {
		return novaSenha;
	}

	public void setNovaSenha(String novaSenha) {
		this.novaSenha = novaSenha;
	}
}
