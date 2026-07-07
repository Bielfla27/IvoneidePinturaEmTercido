package br.com.gabrielfelix.ivoneide_pintura_api.user.dto;

import java.time.LocalDateTime;

import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRole;

public class UserResponse {

	private Long id;
	private String nome;
	private String email;
	private UserRole role;
	private Boolean ativo;
	private LocalDateTime criadoEm;
	private LocalDateTime atualizadoEm;

	public UserResponse(User user) {
		this.id = user.getId();
		this.nome = user.getNome();
		this.email = user.getEmail();
		this.role = user.getRole();
		this.ativo = user.getAtivo();
		this.criadoEm = user.getCriadoEm();
		this.atualizadoEm = user.getAtualizadoEm();
	}

	public Long getId() {
		return id;
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

	public Boolean getAtivo() {
		return ativo;
	}

	public LocalDateTime getCriadoEm() {
		return criadoEm;
	}

	public LocalDateTime getAtualizadoEm() {
		return atualizadoEm;
	}
}
