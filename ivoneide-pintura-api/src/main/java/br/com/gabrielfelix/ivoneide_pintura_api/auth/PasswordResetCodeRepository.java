package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gabrielfelix.ivoneide_pintura_api.user.User;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

	Optional<PasswordResetCode> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}
