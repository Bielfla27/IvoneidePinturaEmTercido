package br.com.gabrielfelix.ivoneide_pintura_api.user.dto;

import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRequest {

	@NotBlank(message = "O nome do usuario e obrigatorio.")
	@Size(max = 120, message = "O nome deve ter no maximo 120 caracteres.")
	private String nome;

	@NotBlank(message = "O e-mail do usuario e obrigatorio.")
	@Email(message = "Informe um e-mail valido.")
	@Size(max = 180, message = "O e-mail deve ter no maximo 180 caracteres.")
	private String email;

	@NotBlank(message = "A senha do usuario e obrigatoria.")
	@Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
	private String senha;

	private UserRole role = UserRole.USER;

	private Boolean ativo = true;

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

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public Boolean getAtivo() {
		return ativo;
	}

	public void setAtivo(Boolean ativo) {
		this.ativo = ativo;
	}
}
