package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import java.time.LocalDateTime;

import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "codigos_recuperacao_senha")
public class PasswordResetCode {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 255)
	private String codeHash;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	@Column(nullable = false)
	private Boolean used;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	public PasswordResetCode() {
	}

	public PasswordResetCode(User user, String codeHash, LocalDateTime expiresAt) {
		this.user = user;
		this.codeHash = codeHash;
		this.expiresAt = expiresAt;
		this.used = false;
	}

	@PrePersist
	public void beforeCreate() {
		this.createdAt = LocalDateTime.now();
	}

	public User getUser() {
		return user;
	}

	public String getCodeHash() {
		return codeHash;
	}

	public LocalDateTime getExpiresAt() {
		return expiresAt;
	}

	public Boolean getUsed() {
		return used;
	}

	public void markAsUsed() {
		this.used = true;
	}
}
