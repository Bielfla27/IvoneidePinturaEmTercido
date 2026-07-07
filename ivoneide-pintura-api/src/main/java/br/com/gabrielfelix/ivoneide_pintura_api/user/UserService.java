package br.com.gabrielfelix.ivoneide_pintura_api.user;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.user.dto.UserRequest;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User create(UserRequest request) {
		String email = request.getEmail().trim().toLowerCase();

		if (userRepository.existsByEmail(email)) {
			throw new UserEmailAlreadyExistsException(email);
		}

		User user = new User(
				request.getNome(),
				email,
				passwordEncoder.encode(request.getSenha()),
				request.getRole() == null ? UserRole.USER : request.getRole(),
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
}
