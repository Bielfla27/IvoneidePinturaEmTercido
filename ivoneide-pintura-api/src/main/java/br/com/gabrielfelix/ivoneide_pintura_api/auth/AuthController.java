package br.com.gabrielfelix.ivoneide_pintura_api.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.LoginResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordRecoveryRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordRecoveryResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.auth.dto.PasswordResetRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/recuperar-senha")
	public ResponseEntity<PasswordRecoveryResponse> recoverPassword(
			@Valid @RequestBody PasswordRecoveryRequest request) {
		return ResponseEntity.ok(authService.startPasswordRecovery(request));
	}

	@PostMapping("/redefinir-senha")
	public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
		authService.resetPassword(request);
		return ResponseEntity.noContent().build();
	}
}
