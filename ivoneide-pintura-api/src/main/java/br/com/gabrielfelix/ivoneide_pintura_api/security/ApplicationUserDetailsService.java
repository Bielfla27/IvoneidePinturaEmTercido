package br.com.gabrielfelix.ivoneide_pintura_api.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.user.User;
import br.com.gabrielfelix.ivoneide_pintura_api.user.UserRepository;

@Service
public class ApplicationUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public ApplicationUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado."));

		return org.springframework.security.core.userdetails.User
				.withUsername(user.getEmail())
				.password(user.getSenha())
				.roles(user.getRole().name())
				.disabled(!Boolean.TRUE.equals(user.getAtivo()))
				.build();
	}
}
