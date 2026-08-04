package br.com.gabrielfelix.ivoneide_pintura_api.auth.dto;

import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRole;

public class LoginResponse {

	private String token;
	private String tipo;
	private Long usuarioId;
	private String nome;
	private String email;
	private UserRole role;

	public LoginResponse(String token, Long usuarioId, String nome, String email, UserRole role) {
		this.token = token;
		this.tipo = "Bearer";
		this.usuarioId = usuarioId;
		this.nome = nome;
		this.email = email;
		this.role = role;
	}

	public String getToken() {
		return token;
	}

	public String getTipo() {
		return tipo;
	}

	public Long getUsuarioId() {
		return usuarioId;
	}

	public String getNome() {
		return nome;
	}

	public String getEmail() {
		return email;
	}

	public UserRole getRole() {
		return role;
	}
}
