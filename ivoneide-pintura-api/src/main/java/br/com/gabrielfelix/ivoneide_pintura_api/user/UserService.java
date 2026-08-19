package br.com.gabrielfelix.ivoneide_pintura_api.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.auth.InvalidCredentialsException;
import br.com.gabrielfelix.ivoneide_pintura_api.user.dto.UserCreateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.user.dto.UserUpdateRequest;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User create(UserCreateRequest request) {
		String email = request.getEmail().trim().toLowerCase();

		if (userRepository.existsByEmail(email)) {
			throw new UserEmailAlreadyExistsException(email);
		}

		User user = new User(
				request.getNome(),
				email,
				passwordEncoder.encode(request.getSenha()),
				UserRole.USER,
				request.getAtivo() == null ? true : request.getAtivo());

		return userRepository.save(user);
	}

	public List<User> findAll() {
		return userRepository.findAll();
	}

	public User findById(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new UserNotFoundException(id));
	}

	public User findByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException(email));
	}

	public User updateProfile(String currentEmail, UserUpdateRequest request) {
		User user = findByEmail(currentEmail);
		String newEmail = request.getEmail().trim().toLowerCase();

		if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
			throw new UserEmailAlreadyExistsException(newEmail);
		}

		user.setNome(request.getNome().trim());
		user.setEmail(newEmail);

		if (hasText(request.getNovaSenha())) {
			if (!hasText(request.getSenhaAtual()) || !passwordEncoder.matches(request.getSenhaAtual(), user.getSenha())) {
				throw new InvalidCredentialsException();
			}

			user.setSenha(passwordEncoder.encode(request.getNovaSenha()));
		}

		return userRepository.save(user);
	}

	private boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
