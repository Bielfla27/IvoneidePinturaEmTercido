package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordRecoveryRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordRecoveryResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordResetRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.security.JwtService;
import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRepository;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordResetCodeRepository passwordResetCodeRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final SecureRandom secureRandom = new SecureRandom();

	public AuthService(UserRepository userRepository, PasswordResetCodeRepository passwordResetCodeRepository,
			PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordResetCodeRepository = passwordResetCodeRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		String email = request.getEmail().trim().toLowerCase();
		User user = userRepository.findByEmail(email)
				.orElseThrow(InvalidCredentialsException::new);

		if (!Boolean.TRUE.equals(user.getAtivo())) {
			throw new InvalidCredentialsException();
		}

		if (!passwordEncoder.matches(request.getSenha(), user.getSenha())) {
			throw new InvalidCredentialsException();
		}

		String token = jwtService.generateToken(user);
		return new LoginResponse(token, user.getId(), user.getNome(), user.getEmail(), user.getRole());
	}

	@Transactional
	public PasswordRecoveryResponse startPasswordRecovery(PasswordRecoveryRequest request) {
		String email = request.getEmail().trim().toLowerCase();
		Optional<User> userOptional = userRepository.findByEmail(email);

		if (userOptional.isEmpty()) {
			return new PasswordRecoveryResponse("Se este e-mail existir, enviaremos um codigo de recuperacao.", null);
		}

		String code = generateCode();
		PasswordResetCode passwordResetCode = new PasswordResetCode(
				userOptional.get(),
				passwordEncoder.encode(code),
				LocalDateTime.now().plusMinutes(15));
		passwordResetCodeRepository.save(passwordResetCode);

		return new PasswordRecoveryResponse("Codigo de recuperacao gerado com sucesso.", code);
	}

	@Transactional
	public void resetPassword(PasswordResetRequest request) {
		String email = request.getEmail().trim().toLowerCase();
		User user = userRepository.findByEmail(email)
				.orElseThrow(InvalidCredentialsException::new);
		PasswordResetCode passwordResetCode = passwordResetCodeRepository
				.findFirstByUserAndUsedFalseOrderByCreatedAtDesc(user)
				.orElseThrow(InvalidCredentialsException::new);

		if (passwordResetCode.getExpiresAt().isBefore(LocalDateTime.now())) {
			passwordResetCode.markAsUsed();
			passwordResetCodeRepository.save(passwordResetCode);
			throw new InvalidCredentialsException();
		}

		if (!passwordEncoder.matches(request.getCodigo().trim(), passwordResetCode.getCodeHash())) {
			throw new InvalidCredentialsException();
		}

		user.setSenha(passwordEncoder.encode(request.getNovaSenha()));
		passwordResetCode.markAsUsed();
		userRepository.save(user);
		passwordResetCodeRepository.save(passwordResetCode);
	}

	private String generateCode() {
		return String.format("%06d", secureRandom.nextInt(1_000_000));
	}
}
