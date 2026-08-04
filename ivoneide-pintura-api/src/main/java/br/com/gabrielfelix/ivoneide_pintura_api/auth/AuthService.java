package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.security.JwtService;
import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRepository;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

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
}
