package br.com.gabrielfelix.ivoneide_pintura_api.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

	@NotBlank(message = "O nome e obrigatorio.")
	@Size(max = 120, message = "O nome deve ter no maximo 120 caracteres.")
	private String nome;

	@NotBlank(message = "O e-mail e obrigatorio.")
	@Email(message = "Informe um e-mail valido.")
	@Size(max = 180, message = "O e-mail deve ter no maximo 180 caracteres.")
	private String email;

	@Size(min = 8, message = "A senha atual deve ter no minimo 8 caracteres.")
	private String senhaAtual;

	@Size(min = 8, message = "A nova senha deve ter no minimo 8 caracteres.")
	private String novaSenha;

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenhaAtual() {
		return senhaAtual;
	}

	public void setSenhaAtual(String senhaAtual) {
		this.senhaAtual = senhaAtual;
	}

	public String getNovaSenha() {
		return novaSenha;
	}

	public void setNovaSenha(String novaSenha) {
		this.novaSenha = novaSenha;
	}
}
