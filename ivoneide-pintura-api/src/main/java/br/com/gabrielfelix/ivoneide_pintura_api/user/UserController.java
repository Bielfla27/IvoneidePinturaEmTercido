package br.com.gabrielfelix.ivoneide_pintura_api.user;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gabrielfelix.ivoneide_pintura_api.user.dto.UserRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.user.dto.UserResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping
	public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
		User user = userService.create(request);
		return ResponseEntity
				.created(URI.create("/api/usuarios/" + user.getId()))
				.body(new UserResponse(user));
	}

	@GetMapping
	public ResponseEntity<List<UserResponse>> findAll() {
		List<UserResponse> users = userService.findAll()
				.stream()
				.map(UserResponse::new)
				.toList();

		return ResponseEntity.ok(users);
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
		User user = userService.findById(id);
		return ResponseEntity.ok(new UserResponse(user));
	}
}
